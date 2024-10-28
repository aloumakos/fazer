import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

const SampleConponent = () => {
  const { t, i18n } = useTranslation()

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  return (
    <div className='border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto'>
      <button className='text-sky-400 animate-pulse text-xl mr-5' onClick={() => changeLanguage("en")}>EN</button>
      <button className='text-sky-400 animate-pulse text-xl' onClick={() => changeLanguage("el")}>GR</button>

      <p>{t('title')}</p>
      <p>{t('description')}</p>
    </div>
  )
}

export default SampleConponent