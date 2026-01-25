export interface IReturnMessage {
    message?: string
}

export type ReturnDataType<T> = {
    message?: string,
    data: T
}