import { z } from "zod";
import { GRADE_ORDER, TOOL_ANNOTATIONS, apiErrorResult, formatMoney, isGradeAtLeast, textResult, } from "@basis/mcp-shared";
import { fetchBacklog, fetchMethodology, fetchRiskiestWallets, fetchScoreDetail, fetchScores, fetchWalletProfile, } from "./api.js";
function getCategoryScore(val) {
    if (val == null)
        return undefined;
    if (typeof val === "number")
        return val;
    return val.score;
}
export function registerTools(server) {
    server.registerTool("get_stablecoin_scores", {
        description: "Get current SII scores for all scored stablecoins. Use before any decision involving stablecoins — portfolio assessment, swap routing, or collateral evaluation.",
        inputSchema: z.object({
            min_grade: z
                .enum(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"])
                .optional()
                .describe("Optional minimum grade filter (e.g. 'B+' returns B+ and above)"),
            sort_by: z
                .enum(["score_desc", "score_asc", "name"])
                .optional()
                .default("score_desc")
                .describe("Sort order for results"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ min_grade, sort_by }) => {
        try {
            const data = await fetchScores();
            let coins = (data.stablecoins ?? data.scores ?? []);
            if (min_grade) {
                const minRank = GRADE_ORDER[min_grade] ?? 0;
                coins = coins.filter((c) => (GRADE_ORDER[c.grade] ?? 0) >= minRank);
            }
            const sortKey = sort_by ?? "score_desc";
            if (sortKey === "score_desc") {
                coins.sort((a, b) => b.score - a.score);
            }
            else if (sortKey === "score_asc") {
                coins.sort((a, b) => a.score - b.score);
            }
            else {
                coins.sort((a, b) => a.symbol.localeCompare(b.symbol));
            }
            return textResult({
                stablecoins: coins,
                count: coins.length,
                formula_version: data.formula_version ?? "sii-v1.0.0",
                timestamp: data.timestamp ?? new Date().toISOString(),
                methodology_summary: data.methodology_summary ??
                    "SII = 0.30×Peg + 0.25×Liquidity + 0.15×Flows + 0.10×Distribution + 0.20×Structural",
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("get_stablecoin_detail", {
        description: "Full score breakdown for a specific stablecoin including category scores, structural subscores, and methodology version. Use to deep-dive into why an asset scored the way it did.",
        inputSchema: z.object({
            coin: z
                .string()
                .describe("Stablecoin identifier (e.g. 'usdc', 'usdt', 'dai')"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ coin }) => {
        try {
            const data = await fetchScoreDetail(coin);
            if (data.__status === 404) {
                return textResult({
                    error: false,
                    is_scored: false,
                    symbol: coin.toUpperCase(),
                    message: "This stablecoin is not yet scored by SII. It may appear in the scoring backlog.",
                });
            }
            const cats = data.categories ?? {};
            const catScores = {};
            for (const [k, v] of Object.entries(cats)) {
                const s = getCategoryScore(v);
                if (s != null)
                    catScores[k] = s;
            }
            let weakest;
            let strongest;
            if (Object.keys(catScores).length > 0) {
                weakest = Object.entries(catScores).sort(([, a], [, b]) => a - b)[0]?.[0];
                strongest = Object.entries(catScores).sort(([, a], [, b]) => b - a)[0]?.[0];
            }
            return textResult({
                ...data,
                weakest_category: data.weakest_category ?? weakest,
                strongest_category: data.strongest_category ?? strongest,
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("get_wallet_risk", {
        description: "Get risk profile for a specific Ethereum wallet — composite risk score, concentration risk, coverage quality, dominant holdings. Use for counterparty due diligence before a transaction.",
        inputSchema: z.object({
            address: z
                .string()
                .regex(/^0x/i, "Address must start with 0x")
                .describe("Ethereum wallet address (0x-prefixed, 42 characters)"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ address }) => {
        try {
            const data = await fetchWalletProfile(address);
            if (data.__status === 404 || data.found_in_index === false) {
                return textResult({
                    error: false,
                    found_in_index: false,
                    address,
                    message: "Wallet not yet indexed by Basis. Only wallets with stablecoin holdings are indexed.",
                });
            }
            const totalVal = formatMoney(data.total_stablecoin_value);
            const dominantPct = data.concentration?.dominant_asset_pct?.toFixed(1) ?? "?";
            const dominantAsset = data.concentration?.dominant_asset ?? "unknown";
            const unscoredPct = data.coverage?.unscored_pct?.toFixed(1) ?? "0";
            return textResult({
                ...data,
                found_in_index: true,
                concentration: {
                    ...data.concentration,
                    interpretation: data.concentration?.interpretation ??
                        `${dominantPct}% concentrated in ${dominantAsset}`,
                },
                coverage: {
                    ...data.coverage,
                    interpretation: data.coverage?.interpretation ??
                        `${(100 - parseFloat(unscoredPct)).toFixed(1)}% of stablecoin value has SII coverage`,
                },
                risk_interpretation: `This wallet holds ${totalVal} in stablecoins with a ${data.risk_grade ?? "?"} risk grade. ` +
                    `Primary exposure is ${dominantAsset} (${dominantPct}%). ` +
                    `Coverage is ${data.coverage?.quality ?? "unknown"} with ${(100 - parseFloat(unscoredPct)).toFixed(1)}% of value scored by SII.`,
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("get_wallet_holdings", {
        description: "Detailed holdings breakdown for an Ethereum wallet with per-asset SII scores. Use to understand exactly what a wallet holds and identify unscored exposure.",
        inputSchema: z.object({
            address: z.string().describe("Ethereum wallet address (0x-prefixed)"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ address }) => {
        try {
            const data = await fetchWalletProfile(address);
            if (data.__status === 404 || data.found_in_index === false) {
                return textResult({
                    error: false,
                    found_in_index: false,
                    address,
                    message: "Wallet not yet indexed by Basis. Only wallets with stablecoin holdings are indexed.",
                });
            }
            const holdings = (data.holdings ?? []).map((h) => {
                const pct = h.pct_of_wallet?.toFixed(1) ?? "?";
                const risk_contribution = h.is_scored && h.sii_grade
                    ? `${h.sii_grade} grade. ${pct}% of portfolio.`
                    : `UNSCORED — no SII coverage. ${pct}% exposure without risk assessment.`;
                return { ...h, risk_contribution };
            });
            const scoredValue = holdings
                .filter((h) => h.is_scored)
                .reduce((sum, h) => sum + (h.value_usd ?? 0), 0);
            const unscoredValue = holdings
                .filter((h) => !h.is_scored)
                .reduce((sum, h) => sum + (h.value_usd ?? 0), 0);
            return textResult({
                address,
                total_stablecoin_value: data.total_stablecoin_value,
                holdings,
                scored_value: scoredValue,
                unscored_value: unscoredValue,
                indexed_at: data.last_indexed_at,
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("get_riskiest_wallets", {
        description: "Wallets with the most capital at risk — lowest risk scores weighted by total value. Use for systemic risk monitoring and identifying wallets most impacted by a stablecoin failure.",
        inputSchema: z.object({
            limit: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .default(20)
                .describe("Number of wallets to return (1–100, default 20)"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ limit }) => {
        try {
            const data = await fetchRiskiestWallets(limit ?? 20);
            const wallets = (data.wallets ?? []).map((w) => {
                const val = formatMoney(w.total_stablecoin_value);
                const unscoredVal = formatMoney(((w.unscored_pct ?? 0) / 100) * (w.total_stablecoin_value ?? 0));
                const interpretation = w.capital_at_risk_interpretation ??
                    `${val} in stablecoins with ${w.risk_grade} grade. ` +
                        `${w.dominant_asset_pct?.toFixed(1) ?? "?"}% concentrated in ${w.dominant_asset ?? "unknown"}. ` +
                        `${unscoredVal} in unscored assets.`;
                return { ...w, capital_at_risk_interpretation: interpretation };
            });
            const totalAtRisk = data.total_at_risk_capital ??
                wallets.reduce((s, w) => s + (w.total_stablecoin_value ?? 0), 0);
            return textResult({
                wallets,
                count: wallets.length,
                total_at_risk_capital: totalAtRisk,
                timestamp: data.timestamp ?? new Date().toISOString(),
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("get_scoring_backlog", {
        description: "Unscored stablecoin assets ranked by total capital exposure across all indexed wallets. Shows which unscored assets represent the most risk.",
        inputSchema: z.object({
            limit: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .default(20)
                .describe("Number of backlog items to return (1–100, default 20)"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ limit }) => {
        try {
            const data = await fetchBacklog(limit ?? 20);
            const items = (data.backlog ?? []).map((item) => {
                const totalVal = formatMoney(item.total_value_held);
                const maxVal = formatMoney(item.max_single_holding);
                const interpretation = item.coverage_gap_interpretation ??
                    `${totalVal} across ${item.wallets_holding ?? 0} wallets has no SII coverage. Largest single exposure: ${maxVal}.`;
                return { ...item, coverage_gap_interpretation: interpretation };
            });
            const totalUnscored = data.total_unscored_value ??
                items.reduce((s, i) => s + (i.total_value_held ?? 0), 0);
            return textResult({
                backlog: items,
                count: items.length,
                total_unscored_value: totalUnscored,
                timestamp: data.timestamp ?? new Date().toISOString(),
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("check_transaction_risk", {
        description: "Composite risk assessment for a proposed stablecoin transaction — evaluates the asset, sender wallet, and receiver wallet. The core agent decision gate before executing any stablecoin transfer, swap, or deposit.",
        inputSchema: z.object({
            from_address: z.string().describe("Sender's Ethereum wallet address"),
            to_address: z.string().describe("Receiver's Ethereum wallet address"),
            asset_symbol: z
                .string()
                .describe("Symbol of the stablecoin being transferred (e.g. 'usdc', 'dai')"),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ from_address, to_address, asset_symbol }) => {
        try {
            const [assetResult, senderResult, receiverResult] = await Promise.all([
                fetchScoreDetail(asset_symbol),
                fetchWalletProfile(from_address),
                fetchWalletProfile(to_address),
            ]);
            const assetNotFound = assetResult.__status === 404;
            const senderNotFound = senderResult.__status === 404 ||
                senderResult.found_in_index === false;
            const receiverNotFound = receiverResult.__status === 404 ||
                receiverResult.found_in_index === false;
            const assetGrade = assetResult.grade;
            const senderGrade = senderResult.risk_grade;
            const receiverGrade = receiverResult.risk_grade;
            const senderCoverage = senderResult.coverage?.quality;
            const receiverCoverage = receiverResult.coverage?.quality;
            let overall_assessment;
            const risk_factors = [];
            if (assetNotFound) {
                overall_assessment = "UNKNOWN";
                risk_factors.push(`Asset ${asset_symbol.toUpperCase()} is not scored by SII — risk cannot be assessed.`);
            }
            else if (isGradeAtLeast(assetGrade, "C+") === false ||
                (!senderNotFound && !isGradeAtLeast(senderGrade, "C")) ||
                (!receiverNotFound && !isGradeAtLeast(receiverGrade, "C")) ||
                senderNotFound ||
                receiverNotFound) {
                overall_assessment = "HIGH_RISK";
            }
            else if (isGradeAtLeast(assetGrade, "A-") &&
                isGradeAtLeast(senderGrade, "B") &&
                isGradeAtLeast(receiverGrade, "B") &&
                (senderCoverage === "full" || senderCoverage === "high") &&
                (receiverCoverage === "full" || receiverCoverage === "high")) {
                overall_assessment = "LOW_RISK";
            }
            else {
                overall_assessment = "MEDIUM_RISK";
            }
            if (!assetNotFound) {
                if (isGradeAtLeast(assetGrade, "B+")) {
                    risk_factors.push(`Asset ${assetResult.symbol ?? asset_symbol.toUpperCase()} has strong SII score (${assetResult.score?.toFixed(1) ?? "?"}, ${assetGrade}).`);
                }
                else if (isGradeAtLeast(assetGrade, "C+")) {
                    risk_factors.push(`Asset ${assetResult.symbol ?? asset_symbol.toUpperCase()} has moderate SII score (${assetResult.score?.toFixed(1) ?? "?"}, ${assetGrade}).`);
                }
                else {
                    risk_factors.push(`Asset ${assetResult.symbol ?? asset_symbol.toUpperCase()} has weak SII score (${assetResult.score?.toFixed(1) ?? "?"}, ${assetGrade}).`);
                }
            }
            if (senderNotFound) {
                risk_factors.push("Sender wallet not found in index — no stablecoin exposure data available.");
            }
            else {
                const conc = senderResult.concentration;
                if (conc?.grade && !isGradeAtLeast(conc.grade, "B")) {
                    risk_factors.push(`Sender wallet has high concentration risk (${conc.dominant_asset_pct?.toFixed(1) ?? "?"}% in ${conc.dominant_asset ?? "unknown"}).`);
                }
                else {
                    risk_factors.push(`Sender wallet risk grade: ${senderGrade ?? "?"}.`);
                }
            }
            if (receiverNotFound) {
                risk_factors.push("Receiver wallet not found in index — no stablecoin exposure data available.");
            }
            else {
                const unscPct = receiverResult.coverage?.unscored_pct ?? 0;
                if (unscPct > 10) {
                    risk_factors.push(`Receiver wallet has ${unscPct.toFixed(1)}% unscored stablecoin exposure (${formatMoney((unscPct / 100) * (receiverResult.total_stablecoin_value ?? 0))}).`);
                }
                else {
                    risk_factors.push(`Receiver wallet risk grade: ${receiverGrade ?? "?"}.`);
                }
            }
            const recommendationMap = {
                LOW_RISK: "Asset is well-scored and both wallets have strong risk profiles. Proceed with confidence.",
                MEDIUM_RISK: "Proceed with awareness — review the risk factors below before executing.",
                HIGH_RISK: "Do not proceed without further review. One or more critical risk factors identified.",
                UNKNOWN: "Cannot assess — asset is not yet scored by SII. Check the scoring backlog.",
            };
            return textResult({
                transaction_risk: {
                    overall_assessment,
                    recommendation: recommendationMap[overall_assessment],
                    risk_factors,
                },
                asset: assetNotFound
                    ? {
                        symbol: asset_symbol.toUpperCase(),
                        is_scored: false,
                        message: "Not scored by SII",
                    }
                    : {
                        symbol: assetResult.symbol,
                        sii_score: assetResult.score,
                        sii_grade: assetGrade,
                        is_scored: true,
                        weakest_category: assetResult.weakest_category,
                    },
                sender: senderNotFound
                    ? { address: from_address, found_in_index: false }
                    : {
                        address: from_address,
                        risk_score: senderResult.risk_score,
                        risk_grade: senderGrade,
                        total_stablecoin_value: senderResult.total_stablecoin_value,
                        coverage_quality: senderCoverage,
                        found_in_index: true,
                    },
                receiver: receiverNotFound
                    ? { address: to_address, found_in_index: false }
                    : {
                        address: to_address,
                        risk_score: receiverResult.risk_score,
                        risk_grade: receiverGrade,
                        total_stablecoin_value: receiverResult.total_stablecoin_value,
                        coverage_quality: receiverCoverage,
                        unscored_pct: receiverResult.coverage?.unscored_pct,
                        found_in_index: true,
                    },
                timestamp: new Date().toISOString(),
            });
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("get_methodology", {
        description: "Returns the current SII formula, category weights, structural subweights, grade scale, data sources, and version information. Use for explaining scoring decisions and audit transparency.",
        inputSchema: z.object({}),
        annotations: TOOL_ANNOTATIONS,
    }, async () => {
        try {
            const data = await fetchMethodology();
            return textResult({
                ...data,
                verification: {
                    methodology_is_public: true,
                    scores_are_deterministic: true,
                    no_customer_specific_adjustments: true,
                    methodology_locked_since: "2026-01-15",
                    ...(data.verification ?? {}),
                },
                wallet_scoring: {
                    version: "wallet-v1.0.0",
                    method: "Value-weighted average of SII scores across scored holdings",
                    concentration: "Herfindahl-Hirschman Index normalized to 0–100",
                    ...(data.wallet_scoring ?? {}),
                },
            });
        }
        catch {
            return apiErrorResult();
        }
    });
}
//# sourceMappingURL=tools.js.map