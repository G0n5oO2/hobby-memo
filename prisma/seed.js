import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// tags は簡易診断の回答タグ・キーワード検索の両方にマッチさせるためのキーワード集合
const hobbies = [
  {
    name: "散歩フォト日記",
    category: "趣味",
    level: 1,
    tags: "屋外,運動,写真,ひとり,無料,スマホ,リラックス",
    description: "近所を歩いてスマホで気になったものを撮るだけ。今日からゼロ円で始められる。",
  },
  {
    name: "読書ノート",
    category: "趣味",
    level: 1,
    tags: "屋内,インドア,読書,ひとり,無料,静か,文系",
    description: "気になる本を1冊読んで一言感想を書くだけ。図書館を使えば費用ゼロ。",
  },
  {
    name: "お絵かき・イラスト",
    category: "制作",
    level: 1,
    tags: "屋内,制作,アート,ひとり,スマホ,クリエイティブ",
    description: "スマホのお絵かきアプリで1日1枚落書き。道具を揃えなくてもすぐ始まる。",
  },
  {
    name: "料理レコーディング",
    category: "趣味",
    level: 2,
    tags: "屋内,料理,生活,グループ,道具あり",
    description: "簡単なレシピを1品作って写真と一緒に記録。一人暮らしの自炊力もつく。",
  },
  {
    name: "筋トレ・宅トレ",
    category: "運動",
    level: 2,
    tags: "屋内,運動,ひとり,体力,道具あり",
    description: "自宅でできる自重トレーニングを週2〜3回。動画を見ながらでOK。",
  },
  {
    name: "簿記3級チャレンジ",
    category: "資格",
    level: 2,
    tags: "資格,文系,勉強,ひとり,将来,静か",
    description: "就活にも役立つ定番資格。テキスト1冊から始められる。",
  },
  {
    name: "プログラミング入門",
    category: "制作",
    level: 3,
    tags: "屋内,制作,理系,クリエイティブ,ひとり,将来,道具あり",
    description: "無料の学習サイトでWebサイト作りから。手を動かすほど形に残る。",
  },
  {
    name: "バンド・楽器演奏",
    category: "趣味",
    level: 3,
    tags: "屋内,音楽,グループ,クリエイティブ,道具あり,体力",
    description: "サークルや友人と楽器を始める。継続すると人前での発表もできる。",
  },
  {
    name: "ボランティア活動",
    category: "趣味",
    level: 3,
    tags: "屋外,グループ,社会貢献,体力,将来",
    description: "地域のイベントやNPOに参加。人とのつながりが増える。",
  },
  {
    name: "TOEIC学習",
    category: "資格",
    level: 3,
    tags: "資格,勉強,ひとり,将来,静か,文系",
    description: "就活・留学にも使えるスコア資格。単語アプリからでも始められる。",
  },
];

async function main() {
  for (const hobby of hobbies) {
    const existing = await prisma.hobby.findFirst({ where: { name: hobby.name } });
    if (existing) {
      await prisma.hobby.update({ where: { id: existing.id }, data: hobby });
    } else {
      await prisma.hobby.create({ data: hobby });
    }
  }
  console.log(`Seeded ${hobbies.length} hobbies.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
