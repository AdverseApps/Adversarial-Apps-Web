'use client'
interface Props {
    riskScore: number;
}

export const RiskScoreExplanation = (props: Props) => {
    const { riskScore } = props;
    if (riskScore <= 1) {
        return (
            <p>A Risk Score of {riskScore} indicates a very low risk of foreign adversary involvement. No significant indicators suggest potential compromise or influence that could impact defense or federal contract eligibility. Standard due diligence is still advised.</p>
        );
    } else if (riskScore <= 2) {
        return (
            <p>A Risk Score of {riskScore} indicates a low risk of foreign adversary involvement. While generally secure, minor indicators suggest a need for review to ensure no potential compromise that could affect defense or federal contract eligibility.</p>
        );
    } else if (riskScore <= 3) {
        return (
            <p>A Risk Score of {riskScore} indicates a moderate risk of foreign adversary involvement. Certain factors suggest potential vulnerabilities that could impact defense or federal contract eligibility. Careful consideration and further investigation are recommended.</p>
        );
    } else if (riskScore <= 4) {
        return (
            <p>A Risk Score of {riskScore} indicates a high risk of foreign adversary involvement. Potential indicators of influence raise significant concerns regarding defense or federal contract eligibility. A thorough assessment is necessary before proceeding.</p>
        );
    } else if (riskScore <= 5) {
        return (
            <p>A Risk Score of {riskScore} indicates a very high risk of foreign adversary involvement. Significant indicators of influence pose a serious threat to defense or federal contract eligibility. A detailed risk evaluation is strongly recommended.</p>
        );
    } else {
        return (
            <p>A Risk Score of 5+ indicates an extreme risk of foreign adversary involvement. Critical indicators of compromise or influence pose an immediate and severe threat to defense or federal contract eligibility. Extensive due diligence and expert consultation are imperative.</p>
        );
    }
}