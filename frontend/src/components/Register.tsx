import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AtSymbolIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/solid'
import { t } from 'i18next'
import axios from "../api/axios";





const Register = () => {
  const { t, i18n } = useTranslation()

  const [registerCredentials, setregisterCredentials] = useState({ username: "", password: "", email: "", fullname: "" });


  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const REGISTER_URL = "/user/register";
    const [fname, lname] = registerCredentials.fullname.split(" ")

    try {
      console.log(registerCredentials)
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({
          "username": registerCredentials.username,
          "password": registerCredentials.password,
          "email": registerCredentials.email
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Registered!", response.data);
    } catch (error: any) {
      console.log(error.response.data)
    }
  }

  const renderForm = (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{t('mail')}:</span>
      </label>
      <label className="input-group">
        <AtSymbolIcon className='h-10 w-10' />
        <input type="text" placeholder="info@site.com" className="input input-ghost" onChange={e => setregisterCredentials({ ...registerCredentials, email: e.target.value })} value={registerCredentials.email} />
      </label>

      <label className="label">
        <span className="label-text">{t('username')}:</span>
      </label>
      <label className="input-group">
        <AtSymbolIcon className='h-10 w-10' />
        <input type="text" className="input input-ghost" onChange={e => setregisterCredentials({ ...registerCredentials, username: e.target.value })} value={registerCredentials.username} />
      </label>

      <label className="label">
        <span className="label-text">{t('password')}:</span>
      </label>
      <label className="input-group">
        <LockClosedIcon  className='h-10 w-10'/>
        <input type="password" className="input input-ghost" onChange={e => setregisterCredentials({ ...registerCredentials, password: e.target.value })} value={registerCredentials.password} />
      </label>

      <label className="label">
        <span className="label-text">{t('fullname')}:</span>
      </label>
      <label className="input-group">
        <UserIcon className='h-10 w-10'/>
        <input type="text" placeholder={t('fn_holder')} className="input input-ghost" onChange={e => setregisterCredentials({ ...registerCredentials, fullname: e.target.value })} value={registerCredentials.fullname} />
      </label>
      <button className="btn btn-outline btn-primary mt-10" onClick={handleSubmit}>{t('register')}</button>
    </div>
  )

  return (
    <div className='rounded-md border border-blue-300 shadow p-8' >
      {renderForm}
    </div>
  )
}

export default Register