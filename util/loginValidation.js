const validateLoginInput = (username, password) => {
  const errors = {};

  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  } else if (!/^[a-z0-9]+$/i.test(username)) {
    errors.username = "Username must only contain alphanumeric characters";
  }

  if (password === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

export default validateLoginInput;
