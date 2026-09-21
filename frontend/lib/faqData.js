// Shared FAQ content: powers both the /faq page and the live chat quick-reply bot.
// Keep `keywords` lowercase - used for simple keyword matching in the chat auto-responder.
export const FAQ_ITEMS = [
  {
    q: 'What are your shipping times?',
    a: 'Standard shipping takes 3-5 business days. Orders over $100 (or Rs. 30,000) ship free; otherwise a flat $9.99 shipping fee applies at checkout.',
    keywords: ['shipping', 'delivery', 'deliver', 'how long', 'arrive'],
  },
  {
    q: 'What is your return policy?',
    a: "We accept returns within 30 days of delivery, as long as items are unworn and in original packaging. Start a return from My Orders, or contact support.",
    keywords: ['return', 'refund', 'exchange'],
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards through Stripe. Prices can be displayed in USD or LKR using the currency switcher at the top of the site.',
    keywords: ['payment', 'pay', 'card', 'stripe', 'currency'],
  },
  {
    q: 'How do I track my order?',
    a: 'Once logged in, go to My Orders to see the live status of every order — pending, paid, processing, shipped, or delivered.',
    keywords: ['track', 'order status', 'where is my order'],
  },
  {
    q: 'How do I contact a real person?',
    a: "Type 'agent' in the chat, or use the live chat here — our support team typically replies within a few minutes during business hours.",
    keywords: ['agent', 'human', 'representative', 'talk to someone', 'contact'],
  },
  {
    q: 'Do you ship internationally?',
    a: "Currently we ship within the countries listed at checkout. If your country isn't listed, reach out via live chat and we'll do our best to help.",
    keywords: ['international', 'worldwide', 'ship to my country'],
  },
];

// Very simple keyword-matching "bot" used by the live chat widget before a human joins.
export function getAutoReply(message) {
  const text = message.toLowerCase();
  const match = FAQ_ITEMS.find((item) => item.keywords.some((k) => text.includes(k)));
  if (match) return match.a;
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return "Hi there! 👋 I'm the coop shop assistant. Ask me about shipping, returns, payments, or order tracking — or type 'agent' to reach a human.";
  }
  return "I'm not sure about that one yet — type 'agent' to reach our support team, or check the FAQ page for more answers.";
}
