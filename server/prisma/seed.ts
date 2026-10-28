import { PrismaClient, TransactionType, type Category } from '@prisma/client';

const prisma = new PrismaClient();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

const categoryData = [
  { name: 'Lương', icon: 'briefcase', color: '#74E3C1', type: TransactionType.INCOME },
  { name: 'Thưởng', icon: 'gift', color: '#B7A6FF', type: TransactionType.INCOME },
  { name: 'Ăn uống', icon: 'restaurant', color: '#FF9D76', type: TransactionType.EXPENSE },
  { name: 'Di chuyển', icon: 'car', color: '#70B7FF', type: TransactionType.EXPENSE },
  { name: 'Mua sắm', icon: 'bag-handle', color: '#F08BC3', type: TransactionType.EXPENSE },
  { name: 'Hóa đơn', icon: 'receipt', color: '#FFD166', type: TransactionType.EXPENSE },
  { name: 'Giải trí', icon: 'game-controller', color: '#A8D672', type: TransactionType.EXPENSE },
  { name: 'Khác', icon: 'ellipsis-horizontal', color: '#9CA5A3', type: TransactionType.EXPENSE },
];

async function main() {
  const categories: Category[] = [];
  for (const data of categoryData) {
    categories.push(
      await prisma.category.upsert({
        where: { name_type: { name: data.name, type: data.type } },
        update: { icon: data.icon, color: data.color },
        create: data,
      }),
    );
  }

  const transactionCount = await prisma.transaction.count();
  if (transactionCount > 0) {
    console.log('Đã có giao dịch, giữ nguyên dữ liệu hiện tại.');
    return;
  }

  const byName = new Map(categories.map((category) => [category.name, category]));
  const create = (name: string, amount: number, note: string, days: number) => {
    const category = byName.get(name)!;
    return prisma.transaction.create({
      data: {
        amount,
        note,
        type: category.type,
        categoryId: category.id,
        occurredAt: daysAgo(days),
      },
    });
  };

  await Promise.all([
    create('Lương', 25_000_000, 'Lương tháng này', 2),
    create('Thưởng', 2_500_000, 'Thưởng dự án', 4),
    create('Ăn uống', 185_000, 'Bữa tối cùng bạn bè', 0),
    create('Di chuyển', 72_000, 'Taxi', 1),
    create('Mua sắm', 1_250_000, 'Giày mới', 3),
    create('Hóa đơn', 680_000, 'Điện và Internet', 5),
    create('Giải trí', 220_000, 'Xem phim', 7),
  ]);

  console.log('Đã tạo dữ liệu mẫu.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
