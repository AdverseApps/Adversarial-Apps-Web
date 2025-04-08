"use client"
import { useState } from "react";
import Link from "next/link";

export default function Page() {
    const [isAdversarialAppsOpen, setIsAdversarialAppsOpen] = useState(false);
    const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
    const [isRiskLevelsOpen, setIsRiskLevelsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    return (
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5 ">About Us and FAQ</h1>

            {/* Adversarial Apps Accordion */}
            <div className="w-full text-white text-lg text-left px-5 py-3 bg-gray-700 rounded-lg mt-5 mb-5 focus-visible:ring-blue-500 focus-visible:ring-12 focus-visible:ring-offset-4"
                tabIndex={0}  // Makes the div tabbable
                role="button"
                onClick={() => setIsAdversarialAppsOpen(!isAdversarialAppsOpen)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsAdversarialAppsOpen(!isAdversarialAppsOpen); // Open/close on Enter or Space
                    }
                }}
            >
                <span className="justify-self-start text-white mr-4">{isAdversarialAppsOpen ? "▲" : "▼"}</span>
                <span className="font-bold text-xl text-white">What is Adversarial Apps?</span>

                {isAdversarialAppsOpen && (
                    <div className="p-5 text-white">
                        <p>Adversarial Apps is an open source student-led project made
                            for UCF Senior Design and sponsored by NSIN and NC DEFTECH. Our mission is to aid
                            start-up companies in searching for business partners whose affiliation will not
                            invalidate them from bidding on United States government contracts.</p>
                    </div>
                )}
            </div>

            {/* Company Assessment Accordion */}
            <div className="w-full text-white text-lg text-left px-5 py-3 bg-gray-700 rounded-lg mt-5 mb-5 focus-visible:ring-blue-500 focus-visible:ring-12 focus-visible:ring-offset-4"
                tabIndex={0}  // Makes the div tabbable
                role="button"
                onClick={() => setIsAssessmentOpen(!isAssessmentOpen)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsAssessmentOpen(!isAssessmentOpen); // Open/close on Enter or Space
                    }
                }}
            >
                <span className="justify-self-start mr-4">{isAssessmentOpen ? "▲" : "▼"}</span>
                <span className="font-bold text-xl text-white">How do we assess companies?</span>
                {isAssessmentOpen && (
                    <div className="p-5">
                        <p className="pl-5">To assess companies in a fair and transparent way, we have
                            determined an extensive grading rubric detailed below which is manually reviewed to
                            ensure the information we gather is as accurate as humanly possible.</p>
                        <p className="pl-5"><br />The company&apos;s score that you see displayed on a company
                            report page is a score ranging from zero to five (including decimals), with
                            <b><u> zero meaning zero influence that a foreign adversary has over a company</u></b> to
                            <b><u> five meaning a foreign adversary has full control over a company</u></b>. It is
                            possible for a score to reach over five for several reasons, including the possibility
                            of a company being controlled by two or more foreign adversaries. The score is
                            calculated via the following step-by-step process by our reviewers:</p>
                        <ol className="pl-5"><br /><b>Step 1: Examine DEF-14A for the given company</b><br />
                            <li className="pl-7">a. Look at the beneficial owners table for each beneficial
                                owner. For each beneficial owner, we assert the following:</li>
                            <li className="pl-10">i. If the beneficial owner is a company, then check to see if they have a score and
                                use that score. If not, repeat the above process for that company to obtain a score.</li>
                        </ol>
                        <ol className="pl-5"><br /><b>Step 2: Check Each Major Beneficial Owner</b><br />
                            <li className="pl-7">a. Once the score is calculated for each beneficial owner, check
                                each owner to see if they own at least 20% of the company. According to most recent
                                legislation as of April 24th, 2024 (H.R.7521 - Protecting Americans from Foreign
                                Adversary Controlled Applications Act), having at least 20% foreign ownership is an
                                issue for a company to be controlled by a foreign influence and thus not good for
                                our standards. If the beneficial owner has at least 20% ownership, take a
                                look at their score.</li>
                            <li className="pl-10">i.<b> If the score is zero,</b> skip ahead to the next
                                company.</li>
                            <li className="pl-10">ii.<b> If the score is between one and two,</b> then the company
                                will get scored a one. Every consecutive offending beneficial owner will increase
                                that score by 0.25.</li>
                            <li className="pl-10">iii.<b> If the score is between three and four,</b> then the
                                company will get scored a three. Every consecutive offending beneficial owner will
                                increase that score by 0.5.</li>
                            <li className="pl-10">iv.<b> If the score is between four and five,</b> then the company
                                will get scored a five which indicates a risk. Every consecutive offending beneficial
                                owner will increase that score by one.</li>
                        </ol>
                        <ol className="pl-5"><br /><b>Step 3: Check Remaining Beneficial Owners</b><br />
                            <li className="pl-7">a. For the remaining beneficial owners with less than 20%
                                ownership, we then add the influence of all sub-20% shareholders together and
                                continue assessments like Step 2. We can consider this as the &quot;residual
                                beneficial owners&quot;.</li>
                            <li className="pl-10">i.<b> If the sum is less than 20%,</b> then set a score for
                                the residual beneficial owners from zero to three based on scores of the major
                                beneficial owners from Step 2. This would mean that a three indicates nearly all
                                major beneficial owners received a five on their risk score, while a zero would
                                indicate very few beneficial owners went higher than a zero score.</li>
                            <li className="pl-10">ii.<b> If the sum is greater or equal to 20%,</b> then we
                                treat this as a singular entity and evaluate it as we would a major beneficial
                                owner from Step 2. In addition, we would also take into account the scores of the
                                other major beneficial owners as we did above, but this time on a scale of zero to
                                five. Similar to the above step, a five would indicate nearly all
                                major beneficial owners received a five on their risk score, while a zero would
                                indicate very few beneficial owners went higher than a zero score.</li>
                        </ol>
                        <p className="pl-5"><br />These individual scores are then combined to produce a result for
                            the calculated risk scores seen on a company result page.
                        </p>
                    </div>
                )}
            </div>

            {/* Risk Score Levels Accordion */}
            <div className="w-full text-white text-lg text-left px-5 py-3 bg-gray-700 rounded-lg mt-5 mb-5 focus-visible:ring-blue-500 focus-visible:ring-12 focus-visible:ring-offset-4"
                tabIndex={0}  // Makes the div tabbable
                role="button"
                onClick={() => setIsRiskLevelsOpen(!isRiskLevelsOpen)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsRiskLevelsOpen(!isRiskLevelsOpen); // Open/close on Enter or Space
                    }
                }}
            >
                <span className="justify-self-start mr-4">{isRiskLevelsOpen ? "▲" : "▼"}</span>
                <span className="font-bold text-white text-xl">What are the Risk Score levels?</span>
                {isRiskLevelsOpen && (
                    <div className="p-5 text-white">
                        <p><b>0 - 1 (Very Low Risk):</b> A Risk Score of 0 to 1 indicates a very low risk of foreign adversary involvement. No significant indicators suggest potential compromise or influence that could impact defense or federal contract eligibility. Standard due diligence is still advised.</p>
                        <p><br /><b>1 - 2 (Low Risk):</b> A Risk Score of 1 to 2 indicates a low risk of foreign adversary involvement. While generally secure, minor indicators suggest a need for review to ensure no potential compromise that could affect defense or federal contract eligibility.</p>
                        <p><br /><b>2 - 3 (Moderate Risk):</b> A Risk Score of 2 to 3 indicates a moderate risk of foreign adversary involvement. Certain factors suggest potential vulnerabilities that could impact defense or federal contract eligibility. Careful consideration and further investigation are recommended.</p>
                        <p><br /><b>3 - 4 (High Risk):</b> A Risk Score of 3 to 4 indicates a high risk of foreign adversary involvement. Potential indicators of influence raise significant concerns regarding defense or federal contract eligibility. A thorough assessment is necessary before proceeding.</p>
                        <p><br /><b>4 - 5 (Very High Risk):</b> A Risk Score of 4 to 5 indicates a very high risk of foreign adversary involvement. Significant indicators of influence pose a serious threat to defense or federal contract eligibility. A detailed risk evaluation is strongly recommended.</p>
                        <p><br /><b>5+ (Extreme Risk):</b> A Risk Score of 5 or more indicates an extreme risk of foreign adversary involvement. Critical indicators of compromise or influence pose an immediate and severe threat to defense or federal contract eligibility. Extensive due diligence and expert consultation are imperative.</p>
                    </div>
                )}
            </div>

            {/* NEW: Privacy Accordion */}
            <div className="w-full text-white text-lg text-left px-5 py-3 bg-gray-700 rounded-lg mt-5 mb-5 focus-visible:ring-blue-500 focus-visible:ring-12 focus-visible:ring-offset-4"
                tabIndex={0}
                role="button"
                onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsPrivacyOpen(!isPrivacyOpen);
                    }
                }}
            >
                <span className="justify-self-start mr-4">{isPrivacyOpen ? "▲" : "▼"}</span>
                <span className="font-bold text-white text-xl">Privacy Statement</span>
                {isPrivacyOpen && (
                    <div className="p-5">
                        <p>Your privacy is important to us. Adversarial Apps does not collect or store any personal identifying information about our users. All searches and assessments are anonymous.</p>
                        <p className="mt-4">We do not use cookies, third-party tracking, or analytics services that compromise your anonymity. Any data used to display risk assessments is sourced from publicly available government databases and is not linked to individual users.
                            Adversarial Apps is an open-source project and all functions of searching are publicly available.
                        </p>
                        <p className="mt-4">Regarding User Creation, we properly hash all passwords and only track user favorites. Nothing else is recorded. While being a user increases website functionality, it is not required.
                        </p>
                        <p className="mt-4">If you have questions or concerns about privacy, feel free to contact us via email at adversarialapps@gmail.com</p>
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="container py-10 px-10 mx-0 min-w-full flex justify-center items-center space-x-4">
                <Link href="/" passHref legacyBehavior>
                    <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
                        aria-label="Back to Homepage">
                        Back to Homepage
                    </button>
                </Link>
            </div>
        </main>
    );
}
