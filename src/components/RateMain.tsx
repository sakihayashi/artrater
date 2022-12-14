import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button, Typography, CircularProgress } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

import RateStars from './RateStarsPainting'
import CompletedModal from './CompletedModal'
// import CookieModal from './CookieModal'
import { ImgTableData, RatingData } from './types'
import {
	MainContainer,
	BtnContainer,
	styledBtn,
	InnerContainer,
	ImgContainer,
	imgStyle,
} from './StyledComponent'
import { findImage, deleteSurvey } from './functions'

const RateMain = () => {
	const { rates } = useParams()
	const minNumOfRatings = 20
	const maxNumOfRatings = 100

	const [numOfRatings, setNumOfRatings] = useState<number>(rates ? +rates : maxNumOfRatings)
	const DELETE_URL = process.env.REACT_APP_DELETE_IMG
	const RANDOM_IMG = process.env.REACT_APP_RANDOM_IMG
	const [imgUrl, setImgUrl] = useState('')
	const [currentData, setCurrentData] = useState<ImgTableData>({ id: 0, title: '' })
	const [completedData, setCompletedData] = useState<RatingData[]>([])
	const [isErr, setIsErr] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isCompleted, setIsCompleted] = useState<boolean>(false)
	const [isEnded, setIsEnded] = useState<boolean>(false)
	const [hasCookie, setHasCookie] = useState<boolean>(false)

	const toggleIsCompleted = () => {
		setIsCompleted(!isCompleted)
	}
	const toggleHasCookie = () => {
		setHasCookie(!hasCookie)
	}
	const getRandomImgData = () => {
		let isDuplicate = true
		do {
			fetch(RANDOM_IMG || '')
				.then((response) => response.json())
				.then((data) => {
					const found = completedData.find((item) => item.id === data.rows[0].id)
					if (found) {
						isDuplicate = true
					} else {
						isDuplicate = false
						setCurrentData(data.rows[0])
						setImgUrl(data.rows[0].image)
					}
				})
				.catch((err) => console.log({ err }))
		} while (!isDuplicate)
		// setIsLoading(false)
		// setIsErr(false)
		setIsEnded(true)
	}
	const toggleIsEnded = () => {
		setIsEnded(!isEnded)
	}
	const updateIsLoading = (state: boolean) => {
		setIsLoading(state)
	}

	const updateComplitedData = (data: RatingData) => {
		setCompletedData((oldArray) => [...oldArray, data])
		setIsEnded(true)
		setIsLoading(false)
		setIsErr(false)
	}
	const handleError = () => {
		console.log('image url broken')
		setIsErr(true)
		if (currentData.image) {
			if (imgUrl.includes('!Large.jpg')) {
				console.log('replacing')
				const replaced = imgUrl.replace('!Large.jpg', '')
				setImgUrl(replaced)
			} else if (imgUrl.includes('!Portrait.jpg')) {
				const replaced = imgUrl.replace('!Portrait.jpg', '')
				setImgUrl(replaced)
			} else {
				const params = { id: '' }
				const url = new URL(DELETE_URL || '')
				params.id = currentData.id + ''
				url.search = new URLSearchParams(params).toString()

				fetch(url).then((res) => {
					getRandomImgData()
				})
			}
		}
	}
	const handlePrevious = async () => {
		const copy = [...completedData]
		const popped = copy.pop()
		setCompletedData(copy)
		if (popped?.paintingId) {
			const data = await findImage(+popped?.paintingId)
			if (data) {
				setIsEnded(true)
				setCurrentData(data.rows[0])
				setImgUrl(data.rows[0].image)
			}
		}
		if (completedData.length && popped?.id) {
			deleteSurvey(popped?.id)
		}
	}
	useEffect(() => {
		if (isErr) {
			setIsErr(false)
		}
	}, [imgUrl])

	useEffect(() => {
		getRandomImgData()
		if (!!rates && +rates > maxNumOfRatings) {
			setNumOfRatings(maxNumOfRatings)
		} else if (!!rates && +rates < minNumOfRatings) {
			setNumOfRatings(minNumOfRatings)
		}
	}, [])

	return (
		<MainContainer>
			<CompletedModal isCompleted={isCompleted} completedData={completedData} />
			{/* <CookieModal hasCookie={hasCookie} toggleHasCookie={toggleHasCookie} /> */}
			<InnerContainer>
				<Typography variant='h2' pt={1}>
					<b>{currentData?.title ? currentData?.title : 'N/A'}</b> by <b>{currentData?.artistName}</b>
				</Typography>
				{isErr || isLoading || !imgUrl ? (
					<CircularProgress color='primary' />
				) : (
					<ImgContainer>
						<img onError={handleError} src={imgUrl} style={imgStyle} />
					</ImgContainer>
				)}
				<RateStars
					getNextData={getRandomImgData}
					isEnded={isEnded}
					toggleIsEnded={toggleIsEnded}
					updateComplitedData={updateComplitedData}
					currentData={currentData}
					toggleIsCompleted={toggleIsCompleted}
					updateIsLoading={updateIsLoading}
					numOfRatings={numOfRatings}
					completedData={completedData}
					imgUrl={imgUrl}
				/>
				<BtnContainer>
					{!!completedData.length && (
						<Button
							variant='text'
							startIcon={<ArrowBackIosNewIcon />}
							sx={styledBtn}
							onClick={handlePrevious}
						>
							Previous
						</Button>
					)}
				</BtnContainer>
			</InnerContainer>
		</MainContainer>
	)
}

export default RateMain
