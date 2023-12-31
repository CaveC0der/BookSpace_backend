import { col, fn, OrderItem } from 'sequelize';
import { OrderableT } from '../types/orderable.type';
import BooksQueryDto from '../../books/dtos/books-query.dto';

export default function extractOrder(dto: OrderableT): OrderItem[] | undefined {
  return dto.orderBy
    ? dto.orderDirection
      ? [[dto.orderBy, dto.orderDirection]]
      : [dto.orderBy]
    : undefined;
}

export function extractBooksOrder(dto: BooksQueryDto): OrderItem[] | undefined {
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
