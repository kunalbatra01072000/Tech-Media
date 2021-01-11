import {
  ADD_COMMENT,
  ADD_POST,
  DELETE_POST,
  GET_POST,
  GET_POSTS,
  POST_ERROR,
  REMOVE_COMMENT,
  UPDATE_LIKES,
} from '../types';

const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: {},
};
const Post = function (state = initialState, { type, payload }) {
  switch (type) {
    case GET_POSTS:
      return {
        ...state,
        posts: payload,
        loading: false,
      };
    case POST_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case UPDATE_LIKES:
      return {
        ...state,
        loading: false,
        posts: state.posts.map((pst) =>
          pst._id === payload.id ? { ...pst, likes: payload.likes } : pst
        ),
      };

    case DELETE_POST:
      return {
        ...state,
        loading: false,
        posts: state.posts.filter((pst) => pst._id !== payload),
      };

    case ADD_POST:
      return {
        ...state,
        posts: [payload, ...state.posts],
        loading: false,
      };

    case GET_POST:
      return {
        ...state,
        post: payload,
        loading: false,
      };

    case ADD_COMMENT:
      return {
        ...state,
        post: {
          ...state.post,
          comments: payload,
        },
        loading: false,
      };
    case REMOVE_COMMENT:
      return {
        ...state,
        post: {
          ...state.post,
          comments: state.post.comments.filter((comm) => comm._id !== payload),
        },
        loading: false,
      };
    default:
      return state;
  }
};

export default Post;
