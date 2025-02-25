export default function page(){
    return (
        <main aria-label="main-content">
            <h1 className="text-6xl font-bold pl-5">About Us and FAQ</h1>
            <h2 className="text-xl font-bold pl-5"><br />What is Adversarial Apps?</h2>
            <p className = "pl-5"><br />Adversarial Apps is an open source student-led project made
                for UCF Senior Design and sponsored by NSIN and NC DEFTECH. Our mission is to aid 
                start-up companies in searching for business partners whose affiliation will not 
                invalidate them from bidding on United States government contracts.</p>

            <h2 className="text-xl font-bold pl-5"><br />How do we assess companies?</h2>
            <p className = "pl-5"><br />To assess companies in a fair and transparent way, we have 
                determined an extensive grading rubric detailed below which is manually reviewed to 
                ensure the information we gather is as accurate as humanly possible.</p>
            <p className = "pl-5"><br />The company&apos;s score that you see displayed on a company
                report page is a score ranging from zero to five (including decimals), with 
                <b><u> zero meaning zero influence that a foreign adversary has over a company</u></b> to 
                <b><u> five meaning a foreign adversary has full control over a company</u></b>. It is
                possible for a score to reach over five for several reasons, including the possibility
                of a company being controlled by two or more foreign adversaries. The score is 
                calculated via the following step-by-step process by our reviewers:</p>
            <ol className = "pl-5"><br /><b>Step 1: Examine DEF-14A for the given company</b><br />
                <li className = "pl-7">a. Look at the beneficial owners table for each beneficial
                    owner. For each beneficial owner, we assert the following:</li>
                <li className = "pl-10">i. If the beneficial owner is a company, then check to see if they have a score and
                    use that score. If not, repeat the above process for that company to obtain a score.</li>
            </ol>
            <ol className = "pl-5"><br /><b>Step 2: Check Each Major Beneficial Owner</b><br />
                <li className = "pl-7">a. Once the score is calculated for each beneficial owner, check
                    each owner to see if they own at least 20% of the company. According to most recent
                    legislation as of April 24th, 2024 (H.R.7521 - Protecting Americans from Foreign
                    Adversary Controlled Applications Act), having at least 20% foreign ownership is an 
                    issue for a company to be controlled by a foreign influence and thus not good for 
                    our standards. If the beneficial owner has at least 20% ownership, take a 
                    look at their score.</li>
                <li className = "pl-10">i.<b> If the score is zero,</b> skip ahead to the next 
                    company.</li>
                <li className = "pl-10">ii.<b> If the score is between one and two,</b> then the company 
                    will get scored a one. Every consecutive offending beneficial owner will increase 
                    that score by 0.25.</li>
                <li className = "pl-10">iii.<b> If the score is between three and four,</b> then the 
                    company will get scored a three. Every consecutive offending beneficial owner will 
                    increase that score by 0.5.</li>
                <li className = "pl-10">iv.<b> If the score is between four and five,</b> then the company 
                    will get scored a five which indicates a risk. Every consecutive offending beneficial 
                    owner will increase that score by one.</li>
            </ol>
        </main>
    );
}