import { Board, Post, Thread } from "dchan";

export abstract class Router {
    public static post({
        n,
        board,
        thread,
        from
    }: Post) {
        const fromId = thread?.op?.from?.id

        return board &&
            !!board &&
            !!board.name &&
            !!board.id && thread && fromId ? `/${board.name}/${board.id}/${fromId}/${thread.n}/${from.id}/${n}` : undefined
    }

    public static thread({
        n,
        op,
        board
    }: Thread) {
        return board &&
            !!board.name &&
            !!board.id &&
            !!n ? `/${board.name}/${board.id}/${op.from.id}/${n}` : undefined
    }

    public static board({
        name,
        id
    }: Board, viewMode?: string) {
        return !!name && !!id ? `/${name}/${id}${viewMode === "catalog" ? "/catalog" : ""}` : undefined
    }

    public static posts() {
        return `/_/posts`
    }

    public static boards() {
        return `/_/boards`
    }
}