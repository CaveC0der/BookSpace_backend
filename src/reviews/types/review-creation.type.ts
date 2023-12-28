export type ReviewCreationT = {
  userId: number
  bookId: number
  rate: number
  text?: string
}