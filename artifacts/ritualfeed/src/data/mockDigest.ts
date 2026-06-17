export interface MockPaper {
  title: string
  authors: string
  score: number
  summary: string
  aiSummary: string
  arxivUrl: string
  topic: 'ML' | 'CV' | 'NLP' | 'RL' | 'Other'
  topicTags: string[]
  citations: number
  publishedAt: Date
}

export const MOCK_DIGEST: MockPaper[] = [
  {
    title: 'Scaling Language Models: Methods, Analysis & Insights from Training Gopher',
    authors: 'Jack W. Rae, Sebastian Borgeaud, Trevor Cai et al.',
    score: 0.94,
    summary:
      'We present Gopher, a 280 billion parameter language model trained on a curated dataset. The paper provides a comprehensive analysis of scaling laws and emergent capabilities across over 152 tasks, revealing critical thresholds where model capabilities dramatically improve.',
    aiSummary: 'Key insight: scaling alone produces qualitative capability jumps. Gopher outperforms GPT-3 on 100+ tasks while revealing where pure scale hits diminishing returns.',
    arxivUrl: 'https://arxiv.org/abs/2112.11446',
    topic: 'NLP',
    topicTags: ['scaling', 'language-models', 'nlp'],
    citations: 3812,
    publishedAt: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    title: 'Segment Anything: A Foundation Model for Image Segmentation',
    authors: 'Alexander Kirillov, Eric Mintun, Nikhila Ravi et al.',
    score: 0.91,
    summary:
      'We introduce the Segment Anything Model (SAM), a promptable model trained on over 1 billion masks on 11 million images. SAM achieves strong zero-shot performance and enables a new era of foundation models for computer vision tasks.',
    aiSummary: 'SAM redefines segmentation as a prompting task — click, box, or text drives masks. The 1B-mask dataset SA-1B is its biggest contribution to the field.',
    arxivUrl: 'https://arxiv.org/abs/2304.02643',
    topic: 'CV',
    topicTags: ['segmentation', 'foundation-model', 'computer-vision'],
    citations: 6540,
    publishedAt: new Date(Date.now() - 1000 * 60 * 28),
  },
  {
    title: 'Decision Transformer: Reinforcement Learning via Sequence Modeling',
    authors: 'Lili Chen, Kevin Lu, Aravind Rajeswaran et al.',
    score: 0.87,
    summary:
      'We present Decision Transformer, which casts reinforcement learning as a sequence modeling problem using a GPT architecture conditioned on returns, past states, and actions. The approach achieves performance comparable to state-of-the-art model-free offline RL methods.',
    aiSummary: 'Eliminates the need for value functions entirely. By conditioning on desired future returns, DT treats RL as a next-token prediction problem — elegant and surprisingly effective.',
    arxivUrl: 'https://arxiv.org/abs/2106.01345',
    topic: 'RL',
    topicTags: ['reinforcement-learning', 'transformers', 'offline-rl'],
    citations: 2291,
    publishedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    title: 'Diffusion Models Beat GANs on Image Synthesis',
    authors: 'Prafulla Dhariwal, Alexander Quinn Nichol',
    score: 0.72,
    summary:
      'We show that diffusion models can achieve image sample quality superior to the current state-of-the-art generative models including GANs. Our ablations show the effects of guidance strength and classifier-free guidance strategies on image quality.',
    aiSummary: 'Classifier guidance is the key unlock. This paper proved diffusion models are not just alternatives to GANs — they are strictly better for sample quality at the cost of inference speed.',
    arxivUrl: 'https://arxiv.org/abs/2105.05233',
    topic: 'CV',
    topicTags: ['diffusion', 'generative-models', 'image-synthesis'],
    citations: 8120,
    publishedAt: new Date(Date.now() - 1000 * 60 * 67),
  },
  {
    title: 'Efficient Transformers: A Survey of Attention Approximations',
    authors: 'Yi Tay, Mostafa Dehghani, Dara Bahri, Donald Metzler',
    score: 0.61,
    summary:
      'We survey over 30 efficient Transformer variants proposed in recent years, categorizing them into sparse attention, linearized attention, memory-compressed, and recurrent approaches. We provide a unified view of the design space and discuss trade-offs.',
    aiSummary: 'Comprehensive map of the attention efficiency landscape. If you need to pick a sparse attention variant for production, start here before reading individual papers.',
    arxivUrl: 'https://arxiv.org/abs/2009.06732',
    topic: 'NLP',
    topicTags: ['transformers', 'efficient-attention', 'survey'],
    citations: 1543,
    publishedAt: new Date(Date.now() - 1000 * 60 * 92),
  },
]

export const MOCK_AGENT_STATUS = {
  cycleCount: 42,
  successRate: 98,
  lastDigest: new Date(Date.now() - 1000 * 60 * 12),
  nextWakeupBlock: 847293,
  walletBalance: '8.2341',
}
