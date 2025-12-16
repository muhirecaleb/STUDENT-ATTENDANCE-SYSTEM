function getNameFromEmail(email) {
    if (!email) return '';
  
    const namePart = email.split('@')[0];
    const cleaned = namePart.replace(/[._-]+/g, ' ');
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  export default getNameFromEmail;
  