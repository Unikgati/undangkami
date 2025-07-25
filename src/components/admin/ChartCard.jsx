// ChartCard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ChartCard = ({ title, children }) => (
  <Card className="glass-effect border-none text-white shadow-lg mb-6">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export default ChartCard;
