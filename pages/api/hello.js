import { getProfiles } from '../../libs/profile'

export default async function handler(req, res) {
  const profiles = await getProfiles()
  res.status(200).json(profiles)
}
