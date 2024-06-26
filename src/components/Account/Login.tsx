import { useEffect, useState } from "react";
import C4Nav from "../../Nav";
import { useNavigate } from "react-router";
import {
  apiAccountLogin,
  apiGetCurrentSessionUser,
  cacheSessionToken,
} from "../../dao";
import Inputs from "./Inputs";
import { Button } from "react-bootstrap";
import TempMessage from "../Util/TempMessage";
import { setUserData } from "../Account/reducer";
import { useSelector, useDispatch } from "react-redux";
import { Connect4State } from "../../store";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const userData = useSelector(
    (state: Connect4State) => state.accountReducer.userData
  );
  const [loginFail, setLoginFail] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    apiGetCurrentSessionUser().then((data) => {
      dispatch(setUserData(data));
    });
  }, []);

  useEffect(() => {
    if (userData) {
      navigate("/home");
    }
  }, [userData]);

  if (userData === undefined) {
    return <TempMessage text="Loading..." />;
  }

  const FIELDS = [
    {
      name: "Username",
      set: setUsername,
      value: username,
    },
    {
      name: "Password",
      set: setPassword,
      value: password,
      type: "password",
    },
  ];
  function login() {
    if (!username || !password) {
      return;
    }
    apiAccountLogin(username, password)
      .then((token) => {
        cacheSessionToken(token);
        navigate("/home");
      })
      .catch(() => {
        setLoginFail(true);
      });
  }

  return (
    <div>
      <C4Nav userData={userData} />
      <div className="login-page">
        <h1>Login</h1>
        <Inputs fields={FIELDS} />
        {loginFail && <p className="error-text">Login Failed</p>}
        <div>
          <Button size="lg" style={{ marginRight: "10px" }} onClick={login}>
            Log in
          </Button>
          <Button size="lg" onClick={() => navigate("/register")}>
            Go Register
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Login;
