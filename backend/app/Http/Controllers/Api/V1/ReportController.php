<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(private ReportService $reports)
    {
    }

    /**
     * GET /reports/{type}?format=pdf|xlsx
     * Supported types: stocks (stock_global), mouvements, inventaire.
     */
    public function show(Request $request, string $type)
    {
        $format = $request->query('format', 'pdf');
        $data   = $this->reports->build($type, $request->query());

        return $format === 'xlsx'
            ? $this->xlsx($data, $type)
            : $this->pdf($data, $type);
    }

    private function pdf(array $data, string $type)
    {
        $pdf = Pdf::loadView('reports.table', $data);

        return $pdf->download("rapport-{$type}-" . now()->format('Ymd-His') . '.pdf');
    }

    private function xlsx(array $data, string $type): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rapport');

        // Header row.
        $sheet->fromArray($data['headers'], null, 'A1');
        // Data rows.
        if (! empty($data['rows'])) {
            $sheet->fromArray($data['rows'], null, 'A2');
        }

        $filename = "rapport-{$type}-" . now()->format('Ymd-His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
