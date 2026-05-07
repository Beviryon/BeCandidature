import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { UserRound, Save } from 'lucide-react'
import { auth, db } from '../firebaseConfig'
import { useToast } from '../contexts/ToastContext'

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  country: 'France',
  program: '',
  schoolName: '',
  linkedinUrl: ''
}

function StudentProfile() {
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [email, setEmail] = useState('')
  const [schoolMembership, setSchoolMembership] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!auth.currentUser) return
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (userSnap.exists()) {
          const userData = userSnap.data()
          setEmail(userData.email || auth.currentUser.email || '')
          setSchoolMembership(userData.schoolMembership || null)
          setProfile({
            ...EMPTY_PROFILE,
            ...(userData.profile || {})
          })
        } else {
          setEmail(auth.currentUser.email || '')
        }
      } catch (error) {
        console.error('Erreur chargement profil étudiant:', error)
        showError("Impossible de charger votre profil.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [showError])

  const fullName = useMemo(() => {
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
  }, [profile.firstName, profile.lastName])

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!auth.currentUser) {
      showError('Utilisateur non authentifié.')
      return
    }

    try {
      setSaving(true)
      const cleanedProfile = {
        ...profile,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phone: profile.phone.trim(),
        addressLine1: profile.addressLine1.trim(),
        addressLine2: profile.addressLine2.trim(),
        postalCode: profile.postalCode.trim(),
        city: profile.city.trim(),
        country: profile.country.trim(),
        program: profile.program.trim(),
        schoolName: profile.schoolName.trim(),
        linkedinUrl: profile.linkedinUrl.trim()
      }

      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        {
          profile: cleanedProfile,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )

      if (schoolMembership?.status === 'active' && schoolMembership?.schoolId) {
        try {
          await setDoc(
            doc(db, 'schools', schoolMembership.schoolId, 'students', auth.currentUser.uid),
            {
              fullName: fullName || '',
              firstName: cleanedProfile.firstName,
              lastName: cleanedProfile.lastName,
              email,
              phone: cleanedProfile.phone,
              address: {
                line1: cleanedProfile.addressLine1,
                line2: cleanedProfile.addressLine2,
                postalCode: cleanedProfile.postalCode,
                city: cleanedProfile.city,
                country: cleanedProfile.country
              },
              program: cleanedProfile.program,
              schoolName: cleanedProfile.schoolName,
              linkedinUrl: cleanedProfile.linkedinUrl,
              profileUpdatedAt: serverTimestamp()
            },
            { merge: true }
          )
        } catch (schoolSyncError) {
          console.warn("Synchronisation profil vers l'espace école impossible:", schoolSyncError)
        }
      }

      success('Profil mis à jour avec succès.')
    } catch (error) {
      console.error('Erreur sauvegarde profil étudiant:', error)
      showError("Impossible d'enregistrer le profil.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-300">Chargement du profil...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
          <UserRound className="w-6 h-6 text-purple-500" />
          Profil étudiant
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Complétez vos informations pour faciliter le suivi par votre école.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={profile.firstName}
            onChange={(event) => handleChange('firstName', event.target.value)}
            placeholder="Prénom"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.lastName}
            onChange={(event) => handleChange('lastName', event.target.value)}
            placeholder="Nom"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="email"
            value={email}
            disabled
            placeholder="Email"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-300"
          />
          <input
            type="text"
            value={profile.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            placeholder="Téléphone"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.program}
            onChange={(event) => handleChange('program', event.target.value)}
            placeholder="Formation / Filière"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.schoolName}
            onChange={(event) => handleChange('schoolName', event.target.value)}
            placeholder="Établissement (optionnel)"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={profile.addressLine1}
            onChange={(event) => handleChange('addressLine1', event.target.value)}
            placeholder="Adresse (ligne 1)"
            className="md:col-span-2 w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.addressLine2}
            onChange={(event) => handleChange('addressLine2', event.target.value)}
            placeholder="Adresse (ligne 2)"
            className="md:col-span-2 w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.postalCode}
            onChange={(event) => handleChange('postalCode', event.target.value)}
            placeholder="Code postal"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.city}
            onChange={(event) => handleChange('city', event.target.value)}
            placeholder="Ville"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.country}
            onChange={(event) => handleChange('country', event.target.value)}
            placeholder="Pays"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profile.linkedinUrl}
            onChange={(event) => handleChange('linkedinUrl', event.target.value)}
            placeholder="Lien LinkedIn (optionnel)"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
        </button>
      </form>
    </div>
  )
}

export default StudentProfile
