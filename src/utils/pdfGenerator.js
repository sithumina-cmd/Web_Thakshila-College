/**
 * Pure client-side PDF document generator for Thakshila College E-Library.
 * Produces valid, standard PDF-1.4 binary blobs that open cleanly in any PDF viewer.
 */
export function generatePastPaperPdf(resource) {
  const safe = (t) =>
    String(t || '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/[()\\]/g, '\\$&');

  const title = resource.title || 'Thakshila College - Academic Evaluation Paper';
  const grade = resource.grade || 'General';
  const subject = resource.subject || 'General';
  const year = resource.year || '2025';
  const category = resource.category || 'Past Papers';

  const defaultLines = [
    `Category: ${category}  |  Academic Year: ${year}`,
    `Grade: ${grade}  |  Subject: ${subject}`,
    '----------------------------------------------------------------------------------',
    'GENERAL INSTRUCTIONS TO CANDIDATES:',
    '1. Answer all questions according to the allocated marks for each section.',
    '2. Write your Index Number clearly in the designated space on the answer sheet.',
    '3. Time Allocation: 2 Hours (Part I - 1 Hour | Part II - 1 Hour).',
    '----------------------------------------------------------------------------------',
    'PART I - STRUCTURED & MULTIPLE CHOICE QUESTIONS (40 Marks)',
    '1. State the fundamental definitions and key theorems related to this topic.',
    '2. Solve the given numerical or conceptual problem and justify your answer steps.',
    '3. Analyze the provided case scenario and deduce the standard outcome.',
    '4. Construct a clear labeled diagram illustrating the primary mechanism.',
    '',
    'PART II - ESSAY & EXTENDED COMPREHENSION (60 Marks)',
    '5. (a) Discuss in detail the theoretical principles taught in the school curriculum.',
    '   (b) Provide balanced arguments and practical real-world applications.',
    '6. Formulate a comprehensive summary explaining the core syllabus competencies.',
    '',
    '----------------------------------------------------------------------------------',
    'Thakshila College - Gampaha | Official Digital E-Library Academic Repository',
    'Knowledge Gives Discipline | Web: thakshilacollege.lk'
  ];

  const questions = Array.isArray(resource.lines) && resource.lines.length > 0
    ? resource.lines
    : defaultLines;

  const lines = [
    'THAKSHILA COLLEGE - GAMPAHA',
    title,
    `Grade: ${grade}  |  Subject: ${subject}  |  Year: ${year}`,
    '',
    ...questions
  ];

  const contentOps = [
    'BT',
    '/F1 15 Tf',
    '50 740 Td',
    `(${safe(lines[0])}) Tj`,
    '/F1 12 Tf',
    '0 -24 Td',
    `(${safe(lines[1])}) Tj`,
    '/F1 10 Tf',
    '0 -20 Td',
    `(${safe(lines[2])}) Tj`,
    '/F1 9 Tf',
    '0 -18 Td'
  ];

  for (let i = 3; i < lines.length; i++) {
    contentOps.push('0 -15 Td');
    contentOps.push(`(${safe(lines[i])}) Tj`);
  }
  contentOps.push('ET');

  const stream = contentOps.join('\n');
  const streamLen = new TextEncoder().encode(stream).length;

  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const o of objs) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += o;
  }
  const xrefPos = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return new Blob([pdf], { type: 'application/pdf' });
}
