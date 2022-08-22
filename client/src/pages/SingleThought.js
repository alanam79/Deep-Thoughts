import React from "react";
import { useParams } from "react-router-dom";
// import query-thought using the useQuery hook import the file path
import { useQuery } from "@apollo/client";
import { QUERY_THOUGHT } from "../utils/queries";
import ReactionList from "../components/ReactionList";
import ReactionForm from "../components/ReactionForm"
import Auth from "../utils/auth";

const SingleThought = (props) => {
  // useParams along with below is a react hook to show the ID
  const { id: thoughtId } = useParams();
  //  The variables loading and data are destructured from the useQuery Hook
  // The loading variable is then used to briefly show a loading <div> element, and the data variable is used to populate a thought object
  //  The useQuery Hook was given a second argument in the form of an object. This is how you can pass variables to queries that need them. The id property on the variables object will become the $id parameter in the GraphQL query.
  const { loading, data } = useQuery(QUERY_THOUGHT, {
    variables: { id: thoughtId },
  });

  const thought = data?.thought || {};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="card mb-3">
        <p className="card-header">
          <span style={{ fontWeight: 700 }} className="text-light">
            {thought.username}
          </span>{" "}
          thought on {thought.createdAt}
        </p>
        <div className="card-body">
          <p>{thought.thoughtText}</p>
        </div>
      </div>
      {/* expression to prevent rendering the reactions if the array is empty. */}
      {thought.reactionCount > 0 && (
        <ReactionList reactions={thought.reactions} />
      )}
      {Auth.loggedIn() && <ReactionForm thoughtId={thought._id} />}
    </div>
  );
};

export default SingleThought;
