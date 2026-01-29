import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have types
import autoTable from 'jspdf-autotable';
import { Sprint, Task, SprintMetrics } from '@/types';
import { format, parseISO } from 'date-fns';

export function generateSprintPresentation(
  sprint: Sprint,
  tasks: Task[],
  metrics: SprintMetrics
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sprint Review', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(sprint.name, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.text(
    `${format(parseISO(sprint.startDate), 'MMM dd, yyyy')} - ${format(parseISO(sprint.endDate), 'MMM dd, yyyy')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sprint Goal', 20, yPosition);
  yPosition += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const goalLines = doc.splitTextToSize(sprint.goal, pageWidth - 40);
  doc.text(goalLines, 20, yPosition);
  yPosition += goalLines.length * 5 + 10;

  // Metrics Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', 20, yPosition);
  yPosition += 7;

  const metricsData = [
    ['Total Tasks', metrics.totalTasks.toString()],
    ['Completed', metrics.completedTasks.toString()],
    ['In Progress', metrics.inProgressTasks.toString()],
    ['Velocity', `${metrics.velocity} Story Points`],
    ['Completion Rate', `${Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Completed Work
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Work Delivered', 20, yPosition);
  yPosition += 10;

  const completedTasks = tasks.filter(t => t.status === 'done');
  const completedData = completedTasks.map(task => [
    task.title,
    task.type,
    task.assignee,
    task.storyPoints?.toString() || '0',
    task.completedAt ? format(parseISO(task.completedAt), 'MMM dd') : 'N/A',
  ]);

  if (completedData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Task', 'Type', 'Assignee', 'SP', 'Completed']],
      body: completedData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
      },
      margin: { left: 20, right: 20 },
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('No completed tasks in this sprint.', 20, yPosition);
  }

  // In Progress Work
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Work In Progress', 20, yPosition);
  yPosition += 10;

  const inProgressTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'todo');
  const inProgressData = inProgressTasks.map(task => [
    task.title,
    task.type,
    task.assignee,
    task.storyPoints?.toString() || '0',
    task.status,
  ]);

  if (inProgressData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Task', 'Type', 'Assignee', 'SP', 'Status']],
      body: inProgressData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
      },
      margin: { left: 20, right: 20 },
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('No tasks in progress.', 20, yPosition);
  }

  // Summary Page
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Sprint Summary', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const summaryPoints = [
    `Sprint Duration: ${format(parseISO(sprint.startDate), 'MMM dd')} - ${format(parseISO(sprint.endDate), 'MMM dd, yyyy')}`,
    `Total Story Points Planned: ${sprint.capacity}`,
    `Story Points Completed: ${metrics.velocity}`,
    `Completion Rate: ${Math.round((metrics.velocity / sprint.capacity) * 100)}%`,
    `Tasks Completed: ${metrics.completedTasks} out of ${metrics.totalTasks}`,
  ];

  summaryPoints.forEach((point, index) => {
    doc.text(`• ${point}`, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Achievements', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const achievements = completedTasks.slice(0, 5).map(t => `✓ ${t.title}`);
  achievements.forEach((achievement, index) => {
    const lines = doc.splitTextToSize(achievement, pageWidth - 40);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 3;
  });

  // Save the PDF
  const fileName = `Sprint-Review-${sprint.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

