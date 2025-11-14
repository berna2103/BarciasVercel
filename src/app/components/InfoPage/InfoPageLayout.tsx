// src/app/components/InfoPage/InfoPageLayout.tsx
import React from 'react';
import { StaticContent, ContentSection } from '@/utils/staticContent';

interface InfoPageLayoutProps {
  contentData: StaticContent;
}

const renderContent = (sections: ContentSection[]) => {
  return sections.map((section, index) => {
    switch (section.type) {
      case 'heading':
        return (
          <div key={index} className="mb-6 mt-8">
            <h3 className="text-2xl font-bold text-darkblue dark:text-white mb-2">{section.title}</h3>
            {section.content && typeof section.content === 'string' && (
                <p className="text-lg font-normal text-lightgrey dark:text-gray-300">{section.content}</p>
            )}
            {section.content && Array.isArray(section.content) && renderContent(section.content)}
          </div>
        );
      case 'paragraph':
        return (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-semibold text-darkblue dark:text-white mb-1">{section.title}</h4>
            <p className="text-base font-normal text-lightgrey dark:text-gray-400">{section.content as string}</p>
          </div>
        );
      case 'list':
        return (
          <div key={index} className="mb-6">
            <ul className="list-disc list-inside space-y-2 ml-4">
                {Array.isArray(section.content) && section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-base font-normal text-lightgrey dark:text-gray-400">
                        <span className="font-semibold text-darkblue dark:text-white">{item.title}:</span> {item.content as string}
                    </li>
                ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  });
};

const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({ contentData }) => {
  return (
    <div className='py-32 min-h-screen bg-white dark:bg-darkmode'>
      <div className='container max-w-4xl'>
        <h1 className='text-4xl md:text-5xl font-bold mb-10 border-b border-gray-200 dark:border-gray-700 pb-4'>
          {contentData.title}
        </h1>
        {renderContent(contentData.sections)}
      </div>
    </div>
  );
};

export default InfoPageLayout;