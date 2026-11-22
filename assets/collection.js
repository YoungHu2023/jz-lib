"use strict";

// Bibliographic descriptions identify real editions. Shelf locations and circulation are illustrative.
const catalog = [
  { id: "wind", title: "The Wind in the Willows", author: "Kenneth Grahame", category: "children", shelf: "C-02", isbn: "9780141321136", publisher: "Puffin", keywords: "river friendship animals 河流 友谊" },
  { id: "moss", title: "Gathering Moss", author: "Robin Wall Kimmerer", category: "nature", shelf: "N-04", isbn: "9780870714993", publisher: "Oregon State University Press", keywords: "botany ecology bryology 植物 苔藓" },
  { id: "earthsea", title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", category: "fantasy", shelf: "F-03", isbn: "9780547773742", publisher: "Houghton Mifflin Harcourt", keywords: "fantasy islands magic 奇幻 魔法" },
  { id: "invisible", title: "Invisible Cities", author: "Italo Calvino", category: "fiction", shelf: "F-07", isbn: "9780156453806", publisher: "Harcourt Brace Jovanovich", keywords: "cities architecture travel 城市 建筑" },
  { id: "design", title: "The Design of Everyday Things", author: "Don Norman", category: "design", shelf: "A-05", isbn: "9780465050659", publisher: "Basic Books", keywords: "objects usability design 设计" },
  { id: "walden", title: "Walden and Civil Disobedience", author: "Henry David Thoreau", category: "essays", shelf: "L-02", isbn: "9780140390445", publisher: "Penguin Classics", keywords: "woods seasons nature 自然 四季" },
  { id: "secret", title: "The Secret Garden", author: "Frances Hodgson Burnett", category: "children", shelf: "C-02", isbn: "9780141321066", publisher: "Puffin", keywords: "gardens family friendship 花园 友谊" },
  { id: "braiding", title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", category: "nature", shelf: "N-04", isbn: "9781571313560", publisher: "Milkweed Editions", keywords: "plants ecology botany 植物 生态" },
  { id: "flower", title: "The Flower-Fed Buffaloes", author: "Vachel Lindsay", category: "poetry", shelf: "P-01", keywords: "poetry prairie anthology 诗歌 草原", format: "pamphlet" },
  { id: "momo", title: "Momo", author: "Michael Ende", category: "fantasy", shelf: "F-03", keywords: "time friendship 时间 友谊" },
  { id: "xiangtu", title: "乡土中国", author: "费孝通", category: "society", shelf: "S-01", publisher: "北京大学出版社", keywords: "Fei Xiaotong From the Soil society sociology 社会 乡村" },
  { id: "chaohua", title: "朝花夕拾", author: "鲁迅", category: "essays", shelf: "L-06", publisher: "人民文学出版社", keywords: "Lu Xun Dawn Blossoms memoirs 散文 回忆" }
];

const genreNames = {
  en: { children: "Children’s literature", nature: "Natural history", fantasy: "Fantasy", fiction: "Fiction", design: "Art & design", essays: "Essays", poetry: "Poetry", society: "Social sciences" },
  "zh-CN": { children: "儿童文学", nature: "自然史", fantasy: "奇幻文学", fiction: "小说", design: "艺术与设计", essays: "散文", poetry: "诗歌", society: "社会科学" }
};
