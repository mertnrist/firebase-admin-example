import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
	getAuth,
	signOut,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from 'firebase/auth'
import {
	doc,
	setDoc,
	onSnapshot,
	collection,
	query,
	orderBy,
	addDoc,
	serverTimestamp,
} from 'firebase/firestore'
import { app, db } from './database/firebase'

function App() {
	const [form, setForm] = useState(false)
	const [signIn, setSignIn] = useState(false)
	const [user, setUser] = useState({})
	const [data, setData] = useState([])

	const onChangeInput = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const { email, password } = form
	const auth = getAuth(app)

	const onSubmitRegister = async (e) => {
		e.preventDefault()
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			)

			console.log(userCredential)
			const userRef = doc(db, 'users', userCredential.user.uid)
			await setDoc(userRef, {
				email: userCredential.user.email,
				createdAt: serverTimestamp(),
			})

			if (userCredential) {
				toast.success('Kayıt olma işlemi başarılı', {
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				})
			}
		} catch (err) {
			toast.error(err.message, {
				style: {
					borderRadius: '10px',
					background: '#333',
					color: '#fff',
				},
			})
		}
	}

	const logOut = (e) => {
		e.preventDefault()
		setUser(false)
		setSignIn(false)
		toast.success('Başarıyla çıkış yapıldı', {
			style: {
				borderRadius: '10px',
				background: '#333',
				color: '#fff',
			},
		})
		localStorage.clear()
		signOut(auth)
	}

	const onSubmitLogin = async (e) => {
		e.preventDefault()
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			)
			if (userCredential) {
				setUser(userCredential.user)
				setSignIn(true)
				localStorage.setItem('user', JSON.stringify(userCredential))

				toast.success('Giriş İşlemi Başarılı', {
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				})
			}
		} catch (err) {
			toast.error(err.message, {
				style: {
					borderRadius: '10px',
					background: '#333',
					color: '#fff',
				},
			})
		}
	}

	const addDataDatabase = async (e) => {
		e.preventDefault()
		try {
			const docRef = await addDoc(collection(db, 'data'), {
				text: form.data,
				timestamp: serverTimestamp(),
			})

			toast.success('Veri eklendi', {
				style: {
					borderRadius: '10px',
					background: '#333',
					color: '#fff',
				},
			})
		} catch (err) {
			toast.error(err.message, {
				style: {
					borderRadius: '10px',
					background: '#333',
					color: '#fff',
				},
			})
		}
	}

	useEffect(() => {
		const userLocalStorage = JSON.parse(localStorage.getItem('user'))
		if (userLocalStorage) {
			setUser(userLocalStorage.user)
			setSignIn(true)
		}

		const fetchData = async () => {
			const dataRef = collection(db, 'data')
			const q = await query(dataRef, orderBy('timestamp', 'desc'))

			onSnapshot(q, (snapshot) => {
				let dataList = []
				snapshot.docs.forEach((doc) => dataList.push(doc.data()))
				setData(dataList)
			})
		}
		fetchData()
	}, [])

	return (
		<div className='container'>
			{!signIn ? (
				<div className='box'>
					{!form ? <p>Veri yok</p> : <p>{JSON.stringify(form)}</p>}
				</div>
			) : (
				<div className='box'>
					<h5>Merhaba, {user.email}</h5>
					<h5>ID: {user.uid}</h5>
					<input
						style={{ backgroundColor: 'gray' }}
						type='submit'
						value='Çıkış Yap'
						onClick={(e) => logOut(e)}
					/>
				</div>
			)}

			{!signIn && (
				<>
					<form onSubmit={(e) => onSubmitRegister(e)}>
						<h1>Kayıt Ol</h1>
						<label htmlFor='email-register'>Email</label>
						<input
							name='email'
							type='email'
							id='email-register'
							placeholder='Email'
							onChange={(e) => onChangeInput(e)}
						/>
						<label htmlFor='password'>Şifre</label>
						<input
							name='password'
							type='password'
							id='password-register'
							placeholder='****'
							onChange={(e) => onChangeInput(e)}
						/>
						<input type='submit' value='Gönder' />
					</form>

					<form onSubmit={(e) => onSubmitLogin(e)}>
						<h1>Giriş Yap</h1>
						<div>
							<h6>
								Admin User admin@gmail.com - Password
								admin@gmail.com
							</h6>
							<h6>
								Normal User user@gmail.com - Password
								user@gmail.com
							</h6>
						</div>
						<label htmlFor='email-login'>Email</label>
						<input
							name='email'
							type='email'
							id='email-login'
							placeholder='Email'
							onChange={(e) => onChangeInput(e)}
						/>
						<label htmlFor='password-login'>Şifre</label>
						<input
							name='password'
							type='password'
							id='password-login'
							placeholder='****'
							onChange={(e) => onChangeInput(e)}
						/>
						<input type='submit' value='Gönder' />
					</form>
				</>
			)}
			{signIn && (
				<>
					<form onSubmit={(e) => addDataDatabase(e)}>
						<input
							type='text'
							name='data'
							placeholder='Veri ekle'
							onChange={(e) => onChangeInput(e)}
						/>
						<input type='submit' value='Ekle' />
					</form>

					<div>
						<ul>
							{data.map((d, i) => (
								<li key={i}>{d.text}</li>
							))}
						</ul>
					</div>
				</>
			)}
		</div>
	)
}

export default App
