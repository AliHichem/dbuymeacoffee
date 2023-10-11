import {Card,Socials} from './';
import Image from "next/image";

interface ProfileCardProps {
    profile: any;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <Card>
      <div className="p-8 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        {profile?.profileImageUrl && (
          <Image
            className="rounded-full object-cover shadow-lg w-24"
            src={profile.profileImageUrl}
            width={96}
            height={96}
            alt=""
          />
        )}
        <div className="text-2xl font-bold tracking-tight  text-zinc-800  my-2">
          {profile.title || 'My name'}
        </div>
        <div>
          <p className="text-orange-500 font-semibold">
            {profile.description || 'My description'}
          </p>
          <p className=" text-sm text-zinc-600 my-4">{profile.about || 'About me'}</p>
        </div>
        <Socials socialIcons={profile?.socials} />
      </div>
    </Card>
  );
}
