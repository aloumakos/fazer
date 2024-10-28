import React, { useState } from "react";
import axios from "../api/axios";
import { useTranslation } from "react-i18next";
import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const LOGIN_URL = "/user/login";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginCredentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    try {
      console.log(loginCredentials);
      const response = await axios.post(
        LOGIN_URL,
        {},
        {
          auth: {
            username: loginCredentials.username,
            password: loginCredentials.password,
          },
        }
      );
      console.log(response.data);
      navigate("/dashboard");
    } catch (error: any) {
      console.log(error.response.data);
    }
  };

  const renderForm = (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {t("mail")} / {t("username")}:
        </span>
      </label>
      <label className="input-group">
        <AtSymbolIcon className="h-10 w-10" />
        <input
          type="text"
          placeholder="info@site.com"
          className="input input-ghost"
          onChange={(e) =>
            setCredentials({ ...loginCredentials, username: e.target.value })
          }
          value={loginCredentials.username}
        />
      </label>

      <label className="label">
        <span className="label-text">{t("password")}:</span>
      </label>
      <label className="input-group">
        <LockClosedIcon className="h-10 w-10" />
        <input
          type="password"
          className="input input-ghost"
          onChange={(e) =>
            setCredentials({ ...loginCredentials, password: e.target.value })
          }
          value={loginCredentials.password}
        />
      </label>
      <button
        className="btn btn-outline btn-primary mt-10"
        onClick={handleSubmit}
      >
        {t("login")}
      </button>
    </div>
  );

  return (
    <div className="lrounded-md border border-blue-300 shadow p-8">
      {renderForm}
    </div>
  );
};

export default Login;
