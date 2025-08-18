import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-6 font-inter">
          About PestPredict
        </h1>
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          PestPredict is designed to assist gardeners and farmers in quickly
          identifying potential pest issues on their plants. By leveraging
          advanced image recognition and large language models, we aim to provide
          accurate predictions and helpful information.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Our mission is to empower plant enthusiasts with the knowledge
          they need to maintain healthy gardens and crops.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;