export interface FaceoffMetric {
  label: string;
  leftValue: number; // 0 - 100
  leftText: string;
  rightValue: number; // 0 - 100
  rightText: string;
  directionLabel: string; // e.g. "数值越低越优" | "数值越高越优"
}

export interface FaceoffSide {
  termId: string;
  nameZh: string;
  nameEn: string;
  category: string;
  essence: string;
  analogy: string;
  bestFor: string[];
  fatalFlaws: string[];
  costStructure: string;
}

export interface FaceoffQuizScenario {
  id: string;
  scenario: string;
  constraint: string;
  correctSide: 'left' | 'right';
  explanation: string;
}

export interface FaceoffPair {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  left: FaceoffSide;
  right: FaceoffSide;
  metrics: FaceoffMetric[];
  decisionRules: {
    chooseLeftWhen: string[];
    chooseRightWhen: string[];
  };
  quiz: FaceoffQuizScenario[];
}
