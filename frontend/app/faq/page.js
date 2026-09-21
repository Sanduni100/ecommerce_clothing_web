'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../../lib/faqData';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Can't find what you're looking for? Use the live chat in the bottom right.</p>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm"
            >
              {item.q}
              <ChevronDown size={18} className={`transition-transform flex-shrink-0 ml-2 ${openIndex === i ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
