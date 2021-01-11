import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addComment } from '../../actions/post';

const CommentForm = ({ postId, addComment }) => {
  const [text, settext] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    addComment(postId, { text });
    settext('');
  };
  return (
    <div className='post-form'>
      <div className='bg-primary p'>
        <h3>Leave a comment</h3>
      </div>
      <form className='form my-1' onSubmit={onSubmit}>
        <textarea
          name='text'
          cols='30'
          rows='3'
          placeholder='Your Comment..'
          required
          value={text}
          onChange={(e) => settext(e.target.value)}
        ></textarea>
        <input
          type='submit'
          className='btn btn-dark my-1'
          value='Add comment'
        />
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  addComment: PropTypes.func.isRequired,
  postId: PropTypes.string.isRequired,
};

export default connect(null, { addComment })(CommentForm);
