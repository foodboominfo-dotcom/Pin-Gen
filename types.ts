
export interface ColorTheme {
  band: string;
  text: string;
  accent: string;
  url: string;
}

export interface GeneratedPin {
  id: string;
  keyword: string;
  image1Base64: string;
  image2Base64: string;
  finalImageBase64: string | null;
  createdAt: number;
  website: string;
  uploadLink?: string;
}

export interface GenerationState {
  isGenerating: boolean;
  step: 'idle' | 'image1' | 'image2' | 'compositing' | 'complete' | 'error';
  error?: string;
  currentKeyword?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export interface PinConfig {
  keywords: string[];
  website: string;
  colors: ColorTheme;
  promptTop: string;
  promptBottom: string;
}

export interface GitHubConfig {
  username: string;
  repo: string;
  token: string;
}
