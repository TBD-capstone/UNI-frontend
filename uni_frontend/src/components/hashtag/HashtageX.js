import React, {useState} from "react";

const HashtagsX = ({hashtags = [], setHashtags}) => {

    const deleteHashtag = (hashtag) => {
        setHashtags(prev => prev.filter(word => word !== hashtag));
    }

    return (
        <div className="Hashtag-section">
            {hashtags.length > 0 && hashtags.map((hashtag, i) => {
                return (
                    <div className="Hashtag" key={`hashtag-${i}`}>
                        <span>#{hashtag}</span>
                        {setHashtags && <button onClick={() => deleteHashtag(hashtag)}>X</button>}
                    </div>
                )
            })}
        </div>
    )
}

export default HashtagsX;