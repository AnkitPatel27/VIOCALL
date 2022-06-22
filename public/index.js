const meeting_id_input = document.querySelector('.meeting_id_input')
const meet_password_input = document.querySelector('.meet_password_input')
const Username_input = document.querySelector('.Username_input')


    if(decodeURIComponent(meeting_id))
    {
        meeting_id_input.value = decodeURIComponent(meeting_id).trim();
    }
    if(decodeURIComponent(meet_password))
    {
        meet_password_input.value = decodeURIComponent(meet_password).trim();
    }


const join_meeting = () => {
    if(!meet_password_input.value.trim())
    {
        meet_password_input.classList.add('red_border')
    }
    if(!Username_input.value.trim())
    {
        Username_input.classList.add('red_border')
    }
    if(!meeting_id_input.value.trim())
    {
        meeting_id_input.classList.add('red_border')
    }
    if(meeting_id_input.value.trim()&&Username_input.value.trim()&&meet_password_input.value.trim()){
        window.location = `/${meeting_id_input.value.trim()}?password=${meet_password_input.value.trim()}&username=${Username_input.value.trim()}`;
    }
}

const new_meet = () =>{
    if(!Username_input.value.trim())
    {
        Username_input.classList.add('red_border')
    }else{
        window.location = `/${new_meetid}?password=${new_meetid}&username=${Username_input.value.trim()}`;
    }
}
