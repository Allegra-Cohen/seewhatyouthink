import { ReactNode } from "react";

const REFERENCES: Record<string, ReactNode> = {
  // Example:
  // "smith": <a href="https://example.com" target="_blank" rel="noopener noreferrer">Smith, J. "On Claims." Journal of Examples, 2024.</a>,
  "anthropic_blackmailing": <a href="https://www.anthropic.com/research/agentic-misalignment">Aengus Lynch et al. “Agentic Misalignment: How LLMs Could Be Insider Threats.” Anthropic.com, 2025.</a>,
  "dupre_2026_psychosis": <a href="https://futurism.com/artificial-intelligence/meta-ai-glasses-desert-aliens">Maggie Harrison Dupré. “A Man Bought Meta’s AI Glasses, and Ended up Wandering the Desert Searching for Aliens to Abduct Him.” Futurism, 15 Jan. 2026</a>,
  "pierre_2025_psychosis": <a href="https://innovationscns.com/youre-not-crazy-a-case-of-new-onset-ai-associated-psychosis/">Joseph M. Pierre et al.“You’re Not Crazy”: A Case of New-Onset AI-Associated Psychosis - Innovations in Clinical Neuroscience.” Innovations in Clinical Neuroscience, 18 Nov. 2025</a>,
  "bansal_2026_psychosis": <a href="https://www.theguardian.com/technology/ng-interactive/2026/feb/28/chatgpt-ai-chatbot-mental-health">Varsha Bansal. “Her Husband Wanted to Use ChatGPT to Create Sustainable Housing. Then It Took over His Life.” The Guardian, 28 Feb. 2026.</a>,
  "oakley_2025_memory": <a href = "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5250447&__cf_chl_tk=jWeX4mzfEKufetP46sC3OkdXdbm0Ej9Z29aPHQpBRdA-1774571529-1.0.1.1-LrGNX4MsyGryGNSmtCInaLuxDEIXC9MSxPEhY3VxOsw"> Barbara Oakley et al. "The Memory Paradox: Why Our Brains Need Knowledge in an Age of AI." SSRN, 14 May 2025</a>,
  "sparrow_2011_google": <a href = "https://www.jstor.org/stable/27978404">Betsy Sparrow et al. "Google Effects on Memory: Cognitive Consequences of Having Information at Our Fingertips." Science, 5 Aug 2011.</a>,
  "anthropic_2025_student": <a href = "https://www.anthropic.com/news/anthropic-education-report-how-university-students-use-claude">Kunal Handa et al. "Anthropic Education Report: How university students use Claude." Anthropic.com, 8 Apr 2025.</a>,
  "klein_2025_hollowed": <a href = "https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1719019/full">Christian Klein and Reinhard Klein. "The extended hollowed mind: why foundational knowledge is indispensable in the age of AI." Frontiers in Artificial Intelligence, 10 Dec 2025.</a>,
  "david_2024_unpleasant": <a href = "https://www.apa.org/pubs/journals/releases/bul-bul0000443.pdf">Louise David et al. "The Unpleasantness of Thinking: A Meta-Analytic Review of the Association Between Mental Effort and Negative Affect." APA Psychological Bulletin, 2024.</a>,
  "ferdman_2025_deskilling": <a href = "https://link.springer.com/article/10.1007/s00146-025-02686-z">Avigail Ferdman. "AI deskilling is a structural problem." AI & Society, 05 Nov 2025.</a>,
  "anthropic_2026_AI": <a href = "https://www.anthropic.com/features/81k-interviews">Saffron Huang et al. "What 81,000 people want from AI." Anthropic.com, 18 Mar 2026.</a>,


};

export function getReference(id: string): ReactNode {
  return REFERENCES[id] ?? `[unknown reference: ${id}]`;
}
