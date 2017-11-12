import React from 'react';

function displayCommentList(comments){
  const displayedComments = [];
  comments.forEach((comment, index) => {
    displayedComments.push(
      <li key={index}>
        { comment.content }
      </li>
    );
  });
  return displayedComments;
}

export default function TeamCommentsDisplay(props) {
  return (
    <div>
      <h4>Comentarios asd</h4>
      <ul> { displayCommentList(props.comments) } </ul>
    </div>
  );
}
