import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff, Building2, Phone, Users, Briefcase, CreditCard, MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { handleFirebaseError } from '../utils/firebaseErrors'

const PLAN_CONFIG = {
  'trial-30': { name: 'Essai 30 jours', price: '0 EUR pendant 30 jours' },
  'school-pro': { name: 'School Pro', price: '149 EUR / mois' },
  'school-enterprise': { name: 'School Enterprise', price: '399 EUR / mois' }
}

function RegisterSchool() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [contactName, setContactName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [studentVolume, setStudentVolume] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('France')
  const [website, setWebsite] = useState('')
  const [siret, setSiret] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [billingPostalCode, setBillingPostalCode] = useState('')
  const [acceptBilling, setAcceptBilling] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const selectedPlan = searchParams.get('plan') || ''

  const selectedPlanMeta = useMemo(
    () => PLAN_CONFIG[selectedPlan] || null,
    [selectedPlan]
  )

  const normalizeCardNumber = (value) => value.replace(/\s+/g, '')

  const validateStep = (targetStep) => {
    if (targetStep === 2) {
      if (!schoolName.trim() || !contactName.trim() || !roleTitle.trim() || !email.trim()) {
        setError('❌ Remplissez les informations de contact de l école.')
        return false
      }
      return true
    }
    if (targetStep === 3) {
      if (!addressLine1.trim() || !postalCode.trim() || !city.trim() || !country.trim()) {
        setError('❌ Remplissez l adresse complete de l ecole.')
        return false
      }
      return true
    }
    return true
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError(null)

    if (!selectedPlanMeta) {
      setError('❌ Offre invalide. Retournez au choix des offres.')
      return
    }

    if (password !== confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 8) {
      setError('❌ Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    const rawCardNumber = normalizeCardNumber(cardNumber)
    if (!cardHolder.trim() || !rawCardNumber || !cardExpiry.trim() || !cardCvc.trim() || !billingPostalCode.trim()) {
      setError('❌ Les informations carte bancaire sont obligatoires, y compris pour l essai gratuit.')
      return
    }
    if (rawCardNumber.length < 12 || rawCardNumber.length > 19) {
      setError('❌ Numéro de carte invalide.')
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      setError('❌ Date d expiration invalide (MM/AA).')
      return
    }
    if (!/^\d{3,4}$/.test(cardCvc.trim())) {
      setError('❌ CVC invalide.')
      return
    }
    if (!acceptBilling) {
      setError('❌ Vous devez accepter les conditions de facturation.')
      return
    }

    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        status: 'active',
        role: 'user',
        accountType: 'school',
        commercialPlan: {
          id: selectedPlan,
          name: selectedPlanMeta.name,
          price: selectedPlanMeta.price,
          requiresCard: true,
          trialDays: selectedPlan === 'trial-30' ? 30 : 0
        },
        schoolLead: {
          schoolName: schoolName.trim(),
          contactName: contactName.trim(),
          roleTitle: roleTitle.trim(),
          phone: phone.trim(),
          studentVolume: studentVolume.trim(),
          address: {
            line1: addressLine1.trim(),
            line2: addressLine2.trim(),
            postalCode: postalCode.trim(),
            city: city.trim(),
            country: country.trim()
          },
          website: website.trim(),
          siret: siret.trim()
        },
        billingPreview: {
          cardHolder: cardHolder.trim(),
          cardLast4: rawCardNumber.slice(-4),
          expiry: cardExpiry.trim(),
          billingPostalCode: billingPostalCode.trim(),
          consentAt: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        approvedBy: 'self-signup'
      })

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err) {
      setError(handleFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-3xl animate-scale-in">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-indigo-500/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 neon-glow">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Inscription École</h1>
            <p className="text-gray-400">Créez votre accès établissement en 3 étapes</p>
          </div>

          {!selectedPlanMeta ? (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
              Offre non sélectionnée. Choisissez d abord une offre école.
              <div className="mt-2">
                <Link to="/register/ecole" className="underline text-red-200">Retour aux offres</Link>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">
                Offre sélectionnée: {selectedPlanMeta.name}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-200">{selectedPlanMeta.price}</p>
              <Link to="/register/ecole" className="text-xs text-indigo-700 dark:text-indigo-300 underline mt-1 inline-block">
                Changer d offre
              </Link>
            </div>
          )}

          <div className="mb-6 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full ${step >= s ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-300">
                  <div className="font-semibold mb-1">✅ Inscription école réussie</div>
                  <div className="text-xs">Votre compte est actif. Vous pouvez vous connecter immédiatement.</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(event) => setSchoolName(event.target.value)}
                      placeholder="Nom de l ecole"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder="Nom du contact"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(event) => setRoleTitle(event.target.value)}
                      placeholder="Fonction (ex: Responsable insertion)"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Telephone"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={studentVolume}
                    onChange={(event) => setStudentVolume(event.target.value)}
                    placeholder="Volume etudiants a suivre (ex: 120)"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email professionnel"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative md:col-span-2">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(event) => setAddressLine1(event.target.value)}
                      placeholder="Adresse (ligne 1)"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(event) => setAddressLine2(event.target.value)}
                    placeholder="Adresse (ligne 2, optionnel)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="Code postal"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Ville"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="Pays"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={siret}
                    onChange={(event) => setSiret(event.target.value)}
                    placeholder="SIRET (optionnel)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="text"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="Site web (optionnel)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </>
            )}

            {step === 3 && (
              <>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700 dark:text-amber-300 mb-2">
                  Carte bancaire obligatoire pour activer le compte, meme avec l offre d essai 30 jours.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative md:col-span-2">
                    <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(event) => setCardHolder(event.target.value)}
                      placeholder="Nom du titulaire"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="Numero de carte"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                    required
                  />
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(event.target.value)}
                    placeholder="Expiration (MM/AA)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(event) => setCardCvc(event.target.value)}
                    placeholder="CVC"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={billingPostalCode}
                    onChange={(event) => setBillingPostalCode(event.target.value)}
                    placeholder="Code postal de facturation"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mot de passe (8 caracteres min.)"
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={acceptBilling}
                      onChange={(event) => setAcceptBilling(event.target.checked)}
                      className="mt-1"
                    />
                    <span>J accepte la pre-autorisation de ma carte et les conditions de facturation.</span>
                  </label>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setStep((prev) => Math.max(1, prev - 1))
                }}
                disabled={step === 1 || loading}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-200 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    const next = step + 1
                    if (validateStep(next)) setStep(next)
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Inscription...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Finaliser l inscription école</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-5 text-center text-sm text-gray-400 space-y-1">
            <p>
              Vous êtes étudiant ?{' '}
              <Link to="/register/etudiant" className="text-purple-400 hover:text-purple-300 font-semibold">
                Inscription étudiant
              </Link>
            </p>
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterSchool
