import { useState } from "react";

export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  // Handle input change event and update the state values
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    callback();
    // print the form values to the console
    console.log(values, "this is the form values from custom hook");
  };

  return {
    handleChange,
    handleSubmit,
    values,
  };
};
