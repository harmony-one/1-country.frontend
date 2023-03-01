
import React from 'react';
import { DynamicApp } from './Remote/DynamicApp';

export const LiveStreamPage: React.FC = () => {
  return (
    <DynamicApp
      url="https://live.0.country/exports.js"
      scope="live"
      module="./App"
    />
  );
}
