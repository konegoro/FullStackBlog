const LoginForm = ({ handleLogin, username, password, setUsername, setPassword }) => (
  <form onSubmit={handleLogin}>
    <div>
        username
      <input
        type="text"
        value={username}
        name="Username"
        data-testid='username'
        onChange={({ target }) => setUsername(target.value)}
      />
    </div>
    <div>
        password
      <input
        type="password"
        value={password}
        name="Password"
        data-testid='password'
        onChange={({ target }) => setPassword(target.value)}
      />
    </div>
    <button type="submit">login</button>
  </form>
)

export default LoginForm