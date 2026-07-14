import Image from "next/image"

interface TeamMemberProps {
  name: string
  title: string
  bio: string
  image: string
}

export function TeamMember({ name, title, bio, image }: TeamMemberProps) {
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="mb-4">
        <Image src={image || "/placeholder.svg"} alt={name} width={120} height={120} className="rounded-full" />
      </div>
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-green-600 mb-4">{title}</p>
      <p className="text-gray-600">{bio}</p>
    </div>
  )
}
