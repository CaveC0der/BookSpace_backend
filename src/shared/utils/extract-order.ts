import { col, fn, OrderItem } from 'sequelize';

export default function extractOrder(dto: { orderBy?: string, orderDirection?: string }): OrderItem[] | undefined {
  return dto.orderBy
    ? dto.orderDirection
      ? [[dto.orderBy, dto.orderDirection]]
      : [dto.orderBy]
    : undefined;
}

export function extractBooksOrder(dto: { orderBy?: string, orderDirection?: string }): OrderItem[] | undefined {
  if (dto.orderBy === 'popularity') {
    return [[
      fn('related_popularity',
        col('BookModel.viewsCount'),
        col('BookModel.reviewsCount'),
        col('BookModel.commentsCount')),
      dto.orderDirection ?? 'ASC',
    ]];
  } else {
    return extractOrder(dto);
  }
}
