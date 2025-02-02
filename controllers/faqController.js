const FAQ = require('../models/faq');
const axios = require('axios');

const translateText = async (text, targetLanguage) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  try {
    const response = await axios.post(url, {
      q: text,
      target: targetLanguage
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Translate question and answer to Hindi and Bengali
    const [question_hi, answer_hi, question_bn, answer_bn] = await Promise.all([
      translateText(question, 'hi'),
      translateText(answer, 'hi'),
      translateText(question, 'bn'),
      translateText(answer, 'bn')
    ]);

    const faq = new FAQ({
      question,
      answer,
      question_hi,
      answer_hi,
      question_bn,
      answer_bn
    });

    await faq.save();
    res.status(201).json({ message: 'FAQ created successfully', faq });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ', details: error.message });
  }
};

exports.getFAQs = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const faqs = await FAQ.find();

    const translatedFAQs = faqs.map(faq => ({
      id: faq._id,
      question: lang === 'hi' ? faq.question_hi : 
                lang === 'bn' ? faq.question_bn : 
                faq.question,
      answer: lang === 'hi' ? faq.answer_hi :
              lang === 'bn' ? faq.answer_bn :
              faq.answer
    }));

    res.status(200).json(translatedFAQs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs', details: error.message });
  }
};
