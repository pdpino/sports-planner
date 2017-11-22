import React from 'react';

function displayDeleteButton(comment, onDelete){
  if (comment.canDelete) {
    const onSubmit = (event) => onDelete(event, { id: comment.id });
    return (
      <form onSubmit={onSubmit}>
        <input class="delete-button-icon" type="image" src="/assets/garbage.png" alt="Eliminar" />
      </form>
    );
  }
}

function displayCommentList(comments, onDelete){
  if (comments.length == 0){
    return (
      <p>
        No hay comentarios
      </p>
    );
  }
  const displayedComments = [];
  comments.forEach((comment, index) => {
    displayedComments.push(
      <li key={index} class="list-item">
        <div>
          <span>
            { comment.commenterName }, { comment.timestamp }:
          </span>
          <span>
            { comment.content }
          </span>
        </div>
        { displayDeleteButton(comment, onDelete) }
      </li>
    );
  });
  return displayedComments;
}

export default function CommentsDisplay(props) {
  return (
    <div>
      <ul> { displayCommentList(props.comments, props.onDelete) } </ul>
    </div>
  );
}
