import React, { useState } from 'react';
// added below useMutation and ADD_REACTION
import { useMutation } from '@apollo/client';
import { ADD_REACTION } from '../../utils/mutations';

const ReactionForm = ({ thoughtId }) => {
  const [reactionBody, setBody] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
//   Declare the necessary mutation variables in the functional component
  const [addReaction, { error }] = useMutation(ADD_REACTION);

  const handleChange = (event) => {
    if (event.target.value.length <= 280) {
      setBody(event.target.value);
      setCharacterCount(event.target.value.length);
    }
  };

//   passing in the values of reactionBody and thoughtId as the mutation's variables.
  const handleFormSubmit = async (event) => {
    event.preventDefault();
// added try/catch here
    try {
      await addReaction({
        variables: { reactionBody, thoughtId },
      });

      // clear form value
      setBody("");
      setCharacterCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <p
    //   added character count, must be called above
        className={`m-0 ${characterCount === 280 || error ? "text-error" : ""}`}
      >
        Character Count: {characterCount}/280
        {/* use the error variable to conditionally render an error message in the JSX. */}
        {error && <span className="ml-2">Something went wrong...</span>}
      </p>
      {/* handleFormSubmit added to the form */}
      <form
        className="flex-row justify-center justify-space-between-md align-stretch"
        onSubmit={handleFormSubmit}
      >
        {/* reactionBody and handleChange added to textarea */}
        <textarea
          placeholder="Leave a reaction to this thought..."
          value={reactionBody}
          className="form-input col-12 col-md-9"
          onChange={handleChange}
        ></textarea>

        <button className="btn col-12 col-md-3" type="submit">
          Submit
        </button>
      </form>
      {error && <div>Something went wrong...</div>}
    </div>
  );
};

export default ReactionForm;
