import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  KeyIcon,
  LanguageIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const SIGNOUT_URL = "/logout";
  const signout = async () => {
    // try {
    //   const response = await axios.post(
    //     SIGNOUT_URL
    //   );
    //   console.log(response.data);
    navigate("/");
    // } catch (error: any) {
    //   console.log(error.response.data);
    // }
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };
  return (
    <div className="navbar bg-base-100 max-w-7xl m-auto">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <Bars3Icon
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a>
                <AdjustmentsHorizontalIcon
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                />
                settings
              </a>
            </li>
            <li tabIndex={0}>
              <a>
                <LanguageIcon
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                />
                lang
                <ChevronRightIcon
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.0}
                  stroke="currentColor"
                  className="w-6 h-6 ml-10"
                />
              </a>
              <ul className="p-2">
                <li>
                  {/* <a onClick={() => changeLanguage("en")}>{t("en")}</a> */}
                </li>
                <li>
                  {/* <a onClick={() => changeLanguage("el")}>{t("el")}</a> */}
                </li>
              </ul>
            </li>
            <li>
              <a>
                <KeyIcon
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                />
                lic
              </a>
            </li>
          </ul>
        </div>
        <Link className="btn btn-ghost normal-case text-xl" to={"/dashboard"}>
          Analyzer Tools
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal p-0">
          <li>
            <a>
              <AdjustmentsHorizontalIcon
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              />
              settings
            </a>
          </li>
          <li tabIndex={0}>
            <a>
              <LanguageIcon
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              />
              lang
              <ChevronDownIcon
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.0}
                stroke="currentColor"
                className="w-6 h-6"
              />
            </a>
            <ul className="p-2">
              <li>
                {/* <a className="w-32" onClick={() => changeLanguage("en")}>
                  {t("en")}
                </a> */}
              </li>
              <li>
                {/* <a className="w-32" onClick={() => changeLanguage("el")}>
                  {t("el")}
                </a> */}
              </li>
            </ul>
          </li>
          <li>
            <a>
              <KeyIcon
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              />
              lic
            </a>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <a onClick={() => signout()} className="btn">
          Logout
        </a>
      </div>
    </div>
  );
};

export default Header;
