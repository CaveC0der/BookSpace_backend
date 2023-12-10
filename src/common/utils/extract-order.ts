import { OrderItem } from 'sequelize';

export default function extractOrder(dto: { orderBy?: string, orderDirection?: string }): OrderItem[] | undefined {
  return dto.orderBy
    ? dto.orderDirection
      ? [[dto.orderBy, dto.orderDirection]]
      : [dto.orderBy]
    : undefined;
}
