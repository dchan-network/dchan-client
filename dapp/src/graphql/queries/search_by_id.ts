import { gql } from "apollo-boost";
import BOARD_FRAGMENT from "graphql/fragments/board";
import POST_FRAGMENT from "graphql/fragments/post";
import THREAD_FRAGMENT from "graphql/fragments/thread";

const SEARCH_BY_ID = gql`
  ${BOARD_FRAGMENT}
  ${THREAD_FRAGMENT}
  ${POST_FRAGMENT}

  query SearchById($id: String!) {
    boardRef(id: $id) {
      board {
        ...Board
      }
    }
    threadRef(id: $id) {
      thread {
        ...Thread
      }
    }
    postRef(id: $id) {
      post {
        ...Post
      }
    }
    board(id: $id) {
      ...Board
    }
    thread(id: $id) {
      ...Thread
    }
    post(id: $id) {
      ...Post
    }
    user(id: $id) {
      id
    }
  }
`;

export default SEARCH_BY_ID