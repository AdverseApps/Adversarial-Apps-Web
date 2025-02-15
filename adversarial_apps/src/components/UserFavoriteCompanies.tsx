'use client';

interface props {
    username: string | null;
}

export const UserFavoriteCompanies = (props: props) => {
    const { username } = props;
    return(
        <div>
            Favorite Companies for username {username}:
        </div>
    )
}